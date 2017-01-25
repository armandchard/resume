(function () {
  'use strict';

  angular
    .module('mbc.admin')
    .factory("adminService", adminService);

  adminService.$inject = ['$q', '$filter', '$http', 'authService', 'profileService', 'CONSTS', 'firebaseDataService', 'refillService', 'listService'];

  function adminService($q, $filter, $http, authService, profileService, CONSTS, firebaseDataService, refillService, listService) {
    var service = {
      createAccount: createAccount,
      getCustomerOrders: getCustomerOrders,
      getStockTransfer: getStockTransfer,
      markAsSent: markAsSent,
      exportDat: exportDat
    };
    return service;

    function createAccount(customer) {
      var deferred = $q.defer();
      var user = { email: customer.email, password: generatePassword() };
      authService.register(user)
        .then(function (data) {
          deferred.resolve();
          createProfile(data.uid, customer)
            .then(function () {
              sendEmail(user);
            });
        })
        .catch(function (error) {
          deferred.reject(error);
        });

      return deferred.promise;
    }

    function sendEmail(user) {
      return $http.post(CONSTS.apiUrl + '/email', user);
    }

    function createProfile(userId, customer) {
      return isValid(customer)
        .then(function (valid) {
          if (!valid) {
            customer.billing_address.company = customer.billing_address.company + generatePassword(3, '0123456789');
          }
          return getCustomerOrders(customer.id)
            .then(function (data) {
              var orders = data.data.orders;
              var profileOrders = [];
              for (var i = 0; i < orders.length; i++) {
                var items = [];
                for (var j = 0; j < orders[i].line_items.length; j++) {
                  var meta = [];
                  for (var k = 0; k < orders[i].line_items[j].meta.length; k++) {
                    meta.push({
                      label: orders[i].line_items[j].meta[k].label,
                      value: orders[i].line_items[j].meta[k].value
                    });
                  }
                  if (meta.length === 1) {
                    meta.push({ label: "Taux de commission", value: "25%" });
                  }
                  items.push({
                    id: orders[i].line_items[j].id,
                    total: orders[i].line_items[j].total,
                    price: orders[i].line_items[j].price,
                    quantity: orders[i].line_items[j].quantity,
                    name: orders[i].line_items[j].name,
                    meta: meta,
                    toSendCountProduct: 0,
                    inBoxCountProduct: 1,
                    boxNumber: 0
                  });
                }
                profileOrders.push({
                  id: orders[i].id,
                  status: orders[i].status,
                  total: orders[i].total,
                  note: orders[i].note,
                  items: items
                });
              }
              firebaseDataService.getUser(userId)
                .$loaded(function (profile) {
                  var profile = profile;
                  profile.firstname = customer.first_name;
                  profile.lastname = customer.last_name;
                  profile.email = customer.email;
                  profile.address = customer.billing_address.address_1;
                  profile.address2 = customer.billing_address.address_2;
                  profile.city = customer.billing_address.city;
                  profile.country = customer.billing_address.country;
                  profile.zipCode = customer.billing_address.postcode;
                  profile.brandName = customer.billing_address.company.length > 0 ? customer.billing_address.company : customer.first_name + ' ' + customer.last_name;
                  profile.company = customer.billing_address.company.length > 0 ? customer.billing_address.company : customer.first_name + ' ' + customer.last_name;
                  profile.phone = customer.billing_address.phone;
                  profile.orders = profileOrders;
                  if (angular.isUndefined(profile.totalToSend)) {
                    profile.totalToSend = 0;
                  }
                  profile.$save();
                })

            });
        });
    }

    function generatePassword(length, charset) {
      length = length || 8,
        charset = charset || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      var retVal = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
    }

    function isValid(customer) {
      var deferred = $q.defer();
      firebaseDataService.getUsers()
        .$loaded(function (users) {
          deferred.resolve(true);
          for (var i = 0; i < users.length; i++) {
            if (users[i].company === customer.billing_address.company) {
              deferred.reject(false);
            }
          }
        });
      return deferred.promise;
    }

    function getCustomerOrders(id) {
      return $http.get(CONSTS.apiUrl + '/woo_customers/' + id + '/orders');
    }

    function getStockTransfer() {
      var deferred = $q.defer();
      $http.get(CONSTS.apiUrl + '/stock_transfers')
        .then(function (data) {
          var st = $filter('filter')(data.data.stock_movements, function (p) {
            return (p.type === 'OUTLET' || p.type === 'RETURN') && p.status !== 'RECEIVED';
          })
          deferred.resolve(st);
        })
        .catch(function (err) {
          deferred.reject(err);
        })
      return deferred.promise;
    }

    function markAsSent(id) {
      var deferred = $q.defer();
      refillService.getConsignment(id)
        .then(function (data) {
          $http.put(CONSTS.apiUrl + '/consignments/' + id + '/sent', data.data)
            .then(function () {
              deferred.resolve();
            })
            .catch(function (err) {
              deferred.reject(err);
            });
        })
        .catch(function (err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function exportDat(id) {
      var deferred = $q.defer();
      listService.getOutlets()
        .then(function (data) {
          var outlets = data.data.outlets;
          refillService.getConsignment(id)
            .then(function (data) {
              var outlet = _.find(outlets, function (o) {
                return o.id === data.data.outlet_id;
              })
              var consignmentsExport = '';
              var consignment = {
                OP_CODE: 'CDC01',
                OP_ACTION: 'A',
                CODE_SITE: 'EN1',
                CODE_SOC: 'MYPOPCORNER',
                N_CDE: data.data.name.replace(/"/g, '').replace(/^"?(.+?)"?$/, '$1'),
                DATE_CDE: $filter('date')(new Date(data.data.consignment_date), 'yyyyMMdd'),
                DATE_DDE: $filter('date')(new Date(data.data.due_at), 'yyyyMMdd'),
                NO_CLIENT: '',
                REF_CLIENT: '',
                PRIORITE_CDE: '',
                TOURNEE: '',
                TRANSPORTEUR: '',
                AFAC_INDIVIDU: '',
                AFAC_RAISON_SOCIAL: '',
                AFAC_ADRESSE1: '',
                AFAC_ADRESSE2: '',
                AFAC_ADRESSE3: '',
                AFAC_CP: '',
                AFAC_VILLE: '',
                AFAC_PAYS: '',
                AFAC_TEL: '',
                AFAC_MAIL: '',
                ALIV_INDIVIDU: '',
                ALIV_RAISON_SOCIAL: 'My Pop Corner - ' + outlet.name,
                ALIV_ADRESSE1: outlet.physical_address1,
                ALIV_ADRESSE2: outlet.physical_address2,
                ALIV_ADRESSE3: '',
                ALIV_CP: outlet.physical_postcode,
                ALIV_VILLE: outlet.physical_city,
                ALIV_PAYS: outlet.physical_country_id,
                ALIV_TEL: '',
                ALIV_MAIL: outlet.email,
                ETAT_STOCK: '',
                RESERVATION: '',
                VALEUR: '',
                PORT: '',
                INSTRUCTION: '',
                COMMT: '',
                COMPLEMENT_1: '',
                COMPLEMENT_2: '',
                COMPLEMENT_3: '',
                COMPLEMENT_4: '',
                COMPLEMENT_5: ''
              };
              _.forEach(consignment, function (value) {
                consignmentsExport += value + ';'
              })
              consignmentsExport += '\n';
              refillService.getConsignmentProducts(id)
                .then(function (products) {
                  var numLigne = 1;
                  for (var i = 0; i < products.length; i++) {
                    var product = {
                      OP_CODE: 'LRC01',
                      OP_ACTION: 'A',
                      CODE_SOC: 'MYPOPCORNER',
                      N_CDE: data.data.name.replace(/"/g, '').replace(/^"?(.+?)"?$/, '$1'),
                      TYPE_LIGNE: 'R',
                      NO_LIGNE: numLigne++,
                      CODE_ART: products[i].sku,
                      QTE_CDE: products[i].toSendCount,
                      INSTRUCTION: '',
                      COMMNT: '',
                      LIBELLE_ART: products[i].name.replace(/"/g, '').replace(/^"?(.+?)"?$/, '$1'),
                      REF_CLIENT: products[i].supplier_code,
                      VALEUR: '',
                      ETAT_STOCK: '',
                      RESERVATION: '',
                      COMPLEMENT_1: '',
                      COMPLEMENT_2: '',
                      COMPLEMENT_3: '',
                      COMPLEMENT_4: '',
                      COMPLEMENT_5: ''
                    };
                    _.forEach(product, function (value) {
                      consignmentsExport += value + ';'
                    })
                    consignmentsExport += '\n';
                  }
                  deferred.resolve(consignmentsExport);
                });
            });
        });
      return deferred.promise;
    }

  }

})();
