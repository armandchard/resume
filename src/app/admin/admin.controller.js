(function () {
  'use strict';
  angular.module('mbc.admin')
    .controller('AdminController', AdminController);

  AdminController.$inject = ['$filter', 'listService', 'toastr', 'DTOptionsBuilder', 'adminService', 'billingService', 'firebaseDataService', 'firebaseStorageService', '$q', 'productService', 'FileSaver', 'Blob', 'paymentService'];

  function AdminController($filter, listService, toastr, DTOptionsBuilder, adminService, billingService, firebaseDataService, firebaseStorageService, $q, productService, FileSaver, Blob, paymentService) {
    var vm = this;
    vm.createAccount = createAccount;
    vm.getCustomerOrders = getCustomerOrders;
    vm.getFirebaseImages = getFirebaseImages;
    vm.exportStockTransfert = exportStockTransfert;
    vm.markAsSent = markAsSent;
    vm.generateBills = generateBills;
    vm.generateXML = generateXML;
    vm.paymentDone = paymentDone;

    vm.filter = {
      search: ''
    }

    listService.getWooCustomers()
      .then(function (data) {
        vm.customers = data.data.customers;
      })
      .catch(function (err) {
        toastr.error(err);
      })

    listService.getOutlets()
      .then(function (data) {
        vm.outlets = data.data.outlets;
      })
      .catch(function (err) {
        toastr.error(err);
      })

    listService.getSuppliers()
      .then(function (data) {
        vm.suppliers = data.data.suppliers;
      })
      .catch(function (err) {
        toastr.error(err);
      });

    firebaseDataService.getUsers()
      .$loaded(function (users) {
        vm.users = users;
      });
    firebaseDataService.getPayments()
      .$loaded(function (payments) {
        vm.payments = payments;
        vm.totalPaymentsCommission = _.sumBy(payments, 'totalCom');
      });
    firebaseDataService.getBills()
      .$loaded(function (bills) {
        vm.bills = bills;
        vm.totalBillsCommission = _.sumBy(bills, 'totalCom');
      });
    firebaseDataService.getMonths()
      .$loaded(function (months) {
        vm.months = months;
      });

    adminService.getStockTransfer()
      .then(function (data) {
        vm.stockTransfers = data;
      })

    function createAccount(customer) {
      swal({
        title: 'Etes-vous sûr de vouloir créer un compte pour cet utilisateur ?',
        text: 'Un email contenant les identifiants sera envoyé à l\'adresse de l\'utilisateur',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: "#e8455e",
        confirmButtonText: 'Oui, rafraîchir!',
        cancelButtonText: 'Annuler',
        closeOnConfirm: true
      },
        function () {
          adminService.createAccount(customer)
            .then(function () {
              toastr.success('Compte créé');
            })
            .catch(function (error) {
              toastr.error(error.message);
            });
        });
    }

    function getCustomerOrders(user) {
      swal({
        title: 'Etes-vous sûr de vouloir récupérer les commandes ?',
        text: 'Cela peut affecter les données déjà saisies dans les commandes existantes ',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: "#e8455e",
        confirmButtonText: 'Oui, rafraîchir!',
        cancelButtonText: 'Annuler',
        closeOnConfirm: true
      },
        function () {
          var customer = $filter('filter')(vm.customers, function (p) {
            return p.first_name === user.firstname && p.last_name === user.lastname;
          })[0];
          adminService.getCustomerOrders(customer.id)
            .then(function (data) {
              if (angular.isUndefined(user.orders)) {
                user.orders = [];
              }
              var orders = data.data.orders;
              for (var i = 0; i < orders.length; i++) {
                var exist = $filter('filter')(user.orders, function (p) {
                  return p.id === orders[i].id;
                })[0];
                if (exist) {
                  continue;
                }
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
                user.orders.push({
                  id: orders[i].id,
                  status: orders[i].status,
                  total: orders[i].total,
                  note: orders[i].note,
                  items: items
                });
              }
              if (angular.isUndefined(user.totalToSend)) {
                user.totalToSend = 0;
              }
              vm.users.$save(user)
                .then(function () {
                  toastr.success(user.orders.length + ' commande(s) récupérée(s)');
                })
                .catch(function (err) {
                  toastr.error(err);
                })
            });
        });
    }

    vm.dtOptions = DTOptionsBuilder.newOptions()
      .withBootstrap()
      .withOption('lengthMenu', [50, 100, 150, 200])
    vm.dtInstance = {};

    function getFirebaseImages() {
      var urlPromises = []
      var uploadPromises = [];
      firebaseDataService.getProducts
        .then(function (data) {
          var products = data;
          for (var i = 0; i < products.length; i++) {
            for (var j = 0; j < products[i].assets.length; j++) {
              if (angular.isDefined(products[i].$id) && products[i].$id !== null && products[i].$id !== '' && angular.isDefined(products[i].assets[j]) && products[i].assets[j] !== null && products[i].assets[j] !== '') {
                urlPromises.push(firebaseStorageService.getFileUrl(products[i].$id, products[i].assets[j]));
              }
            }
          }
          $q.all(urlPromises)
            .then(function (data) {
              for (var i = 0; i < data.length; i++) {
                if (angular.isDefined(data[i]) && angular.isDefined(data[i].url)) {
                  uploadPromises.push(productService.uploadVendImage(data[i].id, data[i].url));
                }
              }
            })
            .then(function () {
              $q.all(uploadPromises)
                .then(function () {
                  swal('Upload enfin terminé');
                })
            })
        });
    }

    function exportStockTransfert(id) {
      vm.loading = true;
      adminService.exportDat(id)
        .then(function (csv) {
          var date = $filter('date')(new Date(), 'yyyyMMddHHmmss');
          var consignments = new Blob([csv], { type: 'text/plain;charset=utf-8' });
          FileSaver.saveAs(consignments, 'MPC_CDC01' + date + '.DAT');
          vm.loading = false;
        })
    }

    function markAsSent(id, $index) {
      adminService.markAs(id, 'sent')
        .then(function () {
          vm.stockTransfers[$index].status = 'SENT';
        })
    }

    function generateBills(month) {
      if (angular.isUndefined(month) || month === null) {
        toastr.error('Il faut sélectionner un mois pour générer les factures !')
        return;
      }
      vm.loading = true;
      billingService.generateBills(parseInt(month))
        .then(function () {
          toastr.success('Terminé');
          vm.loading = false;
        })
        .catch(function (err) {
          toastr.error(err);
          vm.loading = false;
        });
    }

    function generateXML() {
      vm.loading = true;
      vm.selected = $filter('filter')(vm.payments, function (payment) {
        return payment.checked;
      });
      if (angular.isUndefined(vm.selected) || vm.selected === null || vm.selected.length === 0) {
        toastr.error('Il faut sélectionner au moins une facture !')
        vm.loading = false;
        return;
      }
      billingService.generateXML(vm.selected)
        .then(function (xml) {
          vm.loading = false;
          for (var i = 0; i < vm.selected.length; i++) {
            vm.selected[i].status = 'Virement effectué'
          }
          var date = $filter('date')(new Date(), 'yyyy_MM_dd_HHmmss');
          var data = new Blob([xml], { type: 'application/json' });
          FileSaver.saveAs(data, 'MBC_REV_' + date + '.xml');
        })
        .catch(function (err) {
          toastr.error(err, 'Erreur');
          vm.loading = false;
        })
    }

    function paymentDone(bill) {
      bill.status = 'Payé';
      // payment.$save();
      paymentService.getCustomers()
        .then(function (data) {
          console.log(data);
        });
    }

  }



})();
