(function () {
  'use strict';

  angular
    .module('mbc.core')
    .factory('firebaseDataService', firebaseDataService);

  firebaseDataService.$inject = ['$firebaseObject', '$firebaseArray', 'Auth'];

  function firebaseDataService($firebaseObject, $firebaseArray, Auth) {
    var root = firebase.database().ref();
    var currentUser = null;
    var service = {
      root: root,
      getBoxColors: getBoxColors,
      getUsers: getUsers,
      getLabels: getLabels,
      getTaxes: getTaxes,
      getVariants: getVariants,
      getProducts: getProducts,
      getMonths: getMonths,
      getFrequencies: getFrequencies,
      getUser: getUser,
      getPaymentCounter: getPaymentCounter,
      getAccount: getAccount,
      getCurrentUser: getCurrentUser,
      getUserByCompany: getUserByCompany,
      getProduct: getProduct,
      getProductAssets: getProductAssets,
      getProfile: getProfile,
      getMerchandising: getMerchandising,
      getUserNotifications: getUserNotifications,
      getUnreadUserNotifications: getUnreadUserNotifications,
      currentUser: currentUser,
      getPayments: getPayments,
      getBills: getBills,
      getVersion: getVersion
    };
    return service;

    function getBoxColors() {
      return $firebaseArray(service.root.child('boxColors'));
    }
    function getUsers() {
      return $firebaseArray(service.root.child('users'));
    }
    function getLabels() {
      return $firebaseArray(service.root.child('labels'));
    }
    function getTaxes() {
      return $firebaseArray(service.root.child('taxes'));
    }
    function getVariants() {
      return $firebaseArray(service.root.child('variants/fr'));
    }
    function getProducts() {
      return $firebaseArray(service.root.child('products'));
    }
    function getMonths() {
      return $firebaseArray(service.root.child('months'));
    }
    function getFrequencies() {
      return $firebaseArray(service.root.child('frequencies'));
    }

    function getUser(uid) {
      return $firebaseObject(service.root.child('users/' + uid));
    }

    function getPaymentCounter() {
      return $firebaseObject(service.root.child('counter/payments'));
    }

    function getAccount() {
      return $firebaseObject(service.root.child('account'));
    }

    function getCurrentUser() {
      if (angular.isUndefined(service.currentUser) || service.currentUser === null) {
        var user = Auth.$getAuth();
        service.currentUser = getUser(user.uid);
        return service.currentUser;
      } else {
        return service.currentUser;
      }
    }

    function getUserByCompany(company) {
      return $firebaseObject(service.root.child('users/').orderByChild('company').equalTo(company));
    }

    function getUserNotifications() {
      if (angular.isUndefined(service.currentUser) || service.currentUser === null) {
        var user = Auth.$getAuth();
        return $firebaseArray(root.child('notifications/' + user.uid));
      } else {
        return $firebaseArray(root.child('notifications/' + service.currentUser.uid));
      }
    }

    function getUnreadUserNotifications() {
      if (angular.isUndefined(service.currentUser) || service.currentUser === null) {
        var user = Auth.$getAuth();
        return $firebaseArray(root.child('notifications/' + user.uid).orderByChild('unread').equalTo('true'));
      } else {
        return $firebaseArray(root.child('notifications/' + service.currentUser.uid).orderByChild('unread').equalTo('true'));
      }
    }

    function getProduct(productId) {
      return $firebaseObject(service.root.child('products/' + productId));
    }

    function getProductAssets(productId) {
      return $firebaseArray(service.root.child('products/' + productId + '/assets'));
    }

    function getProfile(id) {
      return $firebaseObject(service.users.child(id).child('images'));
    }

    function getMerchandising(outlet, uid, box) {
      if (angular.isUndefined(box)) {
        return $firebaseObject(service.root.child('merchandising/' + outlet + '/' + uid));
      }
      return $firebaseArray(service.root.child('merchandising/' + outlet + '/' + uid + '/products/' + box).orderByChild('position'));
    }

    function getPayments() {
      return $firebaseArray(service.root.child('payments'));
    }

    function getBills() {
      return $firebaseArray(service.root.child('bills'));
    }

    function getVersion() {
      return $firebaseObject(service.root.child('counter/version'));
    }
  }

})();
