(function () {
  'use strict';

  angular
    .module('mbc.profile')
    .service('profileService', profileService);

  profileService.$inject = ['$firebaseObject'];

  function profileService($firebaseObject) {
    var root = firebase.database().ref();
    var service = {
      getProfile: getProfile
    };
    return service;

    function getProfile(uid) {
      return $firebaseObject(root.child('profile'));
    }

  }
})();