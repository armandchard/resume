(function () {
  'use strict';

  angular
    .module('mbc.admin')
    .factory('billingService', billingService);

  billingService.$inject = ['$q', '$filter', '$http', 'CONSTS', 'firebaseDataService', 'listService', 'saleService', 'productService', 'x2js'];

  function billingService($q, $filter, $http, CONSTS, firebaseDataService, listService, saleService, productService, x2js) {
    var products = [];
    var sales = [];
    var registers = [];
    var outlets = [];
    var users = [];
    var payments = {};
    var bills = {};
    var service = {
      generateBills: generateBills,
      generateXML: generateXML
    };
    return service;

    function generateXML(payments) {
      var deferred = $q.defer();
      firebaseDataService.getAccount()
        .$loaded(function (account) {
          var month = new Date().getMonth();
          var date = $filter('date')(new Date(), 'yyyy-MM-dd');
          var dateVir = $filter('date')(new Date(), 'yyyy-MM-');
          var dateCre = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss');
          var CdtTrfTxInf = [];
          for (var i = 0; i < payments.length; i++) {
            //TODO Ajouter les infos de paiement
            CdtTrfTxInf.push({
              'PmtId': {
                'InstrId': payments[i].number + '/' + month + '/' + i,
                'EndToEndId': payments[i].number + '/' + month + '/' + date
              },
              'Amt': {
                'InstdAmt': {
                  '_Ccy': 'EUR',
                  '__text': payments[i].totalToPay.toFixed(2).toString()
                }
              },
              'CdtrAgt': {
                'FinInstnId': {
                  'BIC': payments[i].user.bic
                }
              },
              'Cdtr': {
                'Nm': payments[i].user.bank
              },
              'CdtrAcct': {
                'Id': {
                  'IBAN': payments[i].user.iban
                }
              },
              'RgltryRptg': {
                'RgltryDtls': {
                  'cd': '150'
                }
              },
              'RmtInf': {
                'Ustrd': payments[i].number
              }
            });
          }
          var ctrlSum = _.sumBy(payments, 'totalToPay');
          var json = {
            'Document': {
              'pain.001.001.02': {
                'GrpHdr': {
                  'MsgId': 'MBC/' + date + '/' + payments.length,
                  'CreDtTm': dateCre,
                  'BtchBookg': 'false',
                  'NbOfTxs': CdtTrfTxInf.length,
                  'CtrlSum': ctrlSum,
                  'Grpg': 'MIXD',
                  'InitgPty': {
                    'Nm': account.owner
                  }
                },
                'PmtInf': {
                  'PmtInfId': 'MBC/' + date + '/' + payments.length,
                  'PmtMtd': 'TRF',
                  'PmtTpInf': {
                    'SvcLvl': {
                      'Cd': 'SEPA'
                    }
                  },
                  'ReqdExctnDt': dateVir + '20', //Date d'exécution requise (ex: le 20 du mois en cours)
                  'Dbtr': {
                    'Nm': account.owner
                  },
                  'DbtrAcct': {
                    'Id': {
                      'IBAN': account.iban
                    }
                  },
                  'DbtrAgt': {
                    'FinInstnId': {
                      'BIC': account.bic
                    }
                  },
                  'ChrgBr': 'SLEV',
                  'CdtTrfTxInf': CdtTrfTxInf
                }
              },
              '_xmlns': 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.02'
            }
          };
          var xml = x2js.json2xml_str(json);
          deferred.resolve(xml);
        });
      return deferred.promise;
    }

    function generateBills(month) {
      var deferred = $q.defer();
      var promises = [];
      payments = firebaseDataService.getPayments();
      bills = firebaseDataService.getBills();
      users = firebaseDataService.getUsers();
      listService.getRegisters()
        .then(function (data) {
          registers = data.data.registers;
        });
      listService.getOutlets()
        .then(function (data) {
          outlets = data.data.outlets;
        });

      productService.getList()
        .then(function (data) {
          products = data;
        })
        .then(function () {
          listService.getRegisterSales()
            .then(function (data) {
              sales = $filter('filter')(data.data, function (sale) {
                var date = new Date(sale.sale_date);
                var dateMonth = date.getMonth()
                return dateMonth === month && sale.status === 'CLOSED';
              });
              listService.getSuppliers()
                .then(function (data) {
                  var suppliers = data.data.suppliers;
                  for (var i = 0; i < suppliers.length; i++) {
                    promises.push(getUserProducts(sales, suppliers[i].name));
                  }
                  $q.all(promises)
                    .then(function (data) {
                      promises = [];
                      for (var i = 0; i < data.length; i++) {
                        _.forIn(data[i].sales, function (value, key) {
                          promises.push(createBill(value, key, data[i].company));
                        })
                      }
                      $q.all(promises)
                        .then(function (data) {
                          deferred.resolve(data);
                        })
                    })
                    .catch(function (err) {
                      deferred.reject(err);
                    })
                })
                .catch(function (err) {
                  deferred.reject(err);
                })
            });
        });
      return deferred.promise;
    }

    function getOultetFromRegister(registerId) {
      var register = _.find(registers, function (register) {
        return register.id === registerId;
      });
      var outlet = _.find(outlets, function (outlet) {
        return outlet.id === register.outlet_id;
      })
      return outlet;
    }

    function createBill(sales, registerId, company) {
      var saledProducts = _.groupBy(sales, 'product.id');
      var outlet = getOultetFromRegister(registerId);
      var deferred = $q.defer();
      var month = CONSTS.months[new Date(sales[0].sale.sale_date).getMonth()];
      var date = $filter('date')(new Date(sales[0].sale.sale_date), '_MM_yyyy_');
      var user = _.find(users, function (user) {
        return user.company === company;
      });
      // Get commission and type of order
      var orderItem;
      if (angular.isDefined(user) && angular.isDefined(user.orders)) {
        for (var i = 0; i < user.orders.length; i++) {
          for (var j = 0; j < user.orders[i].items.length; j++) {
            if (user.orders[i].items[j].outlet === outlet.name) {
              orderItem = user.orders[i].items[j];
            }
          }
        }
        firebaseDataService.getPaymentCounter()
          .$loaded(function (counter) {
            // Create the bill template
            var bill = {
              company: company,
              user: user,
              date: Date.now(),
              month: month,
              number: 'MBC_REV' + date + counter.$value,
              outletName: outlet.name,
              outletId: outlet.id,
              status: 'A payer'
            };
            // Camelize the meta label to use it in Bill object 'Taux de commission' becomes 'tauxDeCommission'
            for (var i = 0; i < orderItem.meta.length; i++) {
              bill[camelize(orderItem.meta[i].label)] = orderItem.meta[i].value;
            }
            if (!_.has(bill, 'tauxDeCommission')) {
              bill.tauxDeCommission = 25;
            }
            // Create lines of saled products
            var lines = [];
            _.forIn(saledProducts, function (product) {
              var salesSum = _.sumBy(product, 'register_sale.quantity');
              var totalHT = _.sumBy(product, 'register_sale.price_total');
              var totalTax = _.sumBy(product, 'register_sale.tax_total');
              var totalTTC = totalHT + totalTax;
              lines.push({
                id: product[0].product.id,
                name: product[0].product.name,
                price: product[0].product.price,
                quantity: salesSum,
                tax: product[0].product.tax_name,
                totalHT: totalHT,
                totalTax: totalTax,
                totalTTC: totalTTC
              });
            });
            bill.lines = lines;
            var totalHT = _.sumBy(lines, 'totalHT');
            bill.totalHT = totalHT;
            var totalCom = totalHT * (parseInt(bill.tauxDeCommission) / 100);
            bill.totalCom = totalCom;
            var totalTTC = _.sumBy(lines, 'totalTTC');
            bill.totalTTC = totalTTC;
            bill.totalToPay = totalTTC - totalCom;
            payments.$add(bill)
              .then(function () {
                bill.number = 'MBC_COM' + date + counter.$value;
                delete (bill.lines);
                bills.$add(bill)
                  .then(function () {
                    deferred.resolve();
                    counter.$value = counter.$value + 1;
                    counter.$save();
                  })
                  .catch(function (err) {
                    deferred.reject(err);
                  })
              })
              .catch(function (err) {
                deferred.reject(err);
              })
          });
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    function getUserProducts(sales, company) {
      var deferred = $q.defer();
      var userProducts = $filter('filter')(products, function (p) {
        return p.supplier_name === company;
      })
      getSalesCount(sales, userProducts)
        .then(function (products) {
          var grouped = _.groupBy(products, function (product) {
            return product.register_sale.register_id;
          });
          deferred.resolve({ company: company, sales: grouped });
        });
      return deferred.promise;
    }

    function getSalesCount(sales, userProducts) {
      var deferred = $q.defer();
      var soldProducts = [];
      for (var i = 0; i < sales.length; i++) {
        sales[i].sale_date = new Date(sales[i].sale_date);
        for (var j = 0; j < sales[i].register_sale_products.length; j++) {
          var find = _.find(userProducts, ['id', sales[i].register_sale_products[j].product_id]);
          if (find) {
            soldProducts.push({ register_sale: sales[i].register_sale_products[j], product: find, sale: sales[i] });
          }
        }
      }
      deferred.resolve(soldProducts);
      return deferred.promise;
    }

    function camelize(str) {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
      }).replace(/\s+/g, '');
    }

  }

})();
