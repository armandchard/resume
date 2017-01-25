(function () {
  'use strict';

  angular
    .module('mbc.core')
    .service('listService', listService);

  listService.$inject = ['$http', 'CONSTS', '$firebaseArray', 'firebaseDataService'];

  function listService($http, CONSTS, $firebaseArray, firebaseDataService) {
    var service = {
      getTaxes: getTaxes,
      getBrands: getBrands,
      getSuppliers: getSuppliers,
      getPaymentTypes: getPaymentTypes,
      getOutlets: getOutlets,
      getProducts: getProducts,
      getProductTypes: getProductTypes,
      getRegisters: getRegisters,
      getRegisterSales: getRegisterSales,
      getVariants: getVariants,
      getBoxColors: getBoxColors,
      getLabels: getLabels,
      getWooCustomers: getWooCustomers
    };
    return service;

    function getTaxes() {
      return firebaseDataService.getTaxes;
    }

    function getBrands() {
      return $http.get(CONSTS.apiUrl + '/brands');
    }

    function getSuppliers() {
      return $http.get(CONSTS.apiUrl + '/suppliers');
    }

    function getPaymentTypes() {
      return $http.get(CONSTS.apiUrl + '/payment_types');
    }

    function getOutlets() {
      return $http.get(CONSTS.apiUrl + '/outlets');
    }

    function getProducts() {
      return $http.get(CONSTS.apiUrl + '/products');
    }

    function getProductTypes() {
      return $http.get(CONSTS.apiUrl + '/product_types');
    }

    function getRegisters() {
      return $http.get(CONSTS.apiUrl + '/registers');
    }

    function getRegisterSales() {
      return $http.get(CONSTS.apiUrl + '/register_sales');
    }

    function getVariants() {
      return firebaseDataService.getVariants;
    }

    function getBoxColors() {
      return firebaseDataService.getBoxColors;
    }

    function getLabels() {
      return firebaseDataService.getLabels;
    }

    function getWooCustomers() {
      return $http.get(CONSTS.apiUrl + '/woo_customers/all');
    }

  }

})();
