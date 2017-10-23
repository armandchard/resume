(function () {
  'use strict';

  angular
    .module('mbc.profile')
    .service('profileService', profileService);

  profileService.$inject = ['$firebaseObject'];

  function profileService($firebaseObject) {
    var service = {
      getProfile: getProfile
    };
    return service;

    function getProfile(lang) {
      lang = lang || 'fr'
      return $firebaseObject(firebase.database().ref('profile/' + lang));
    }

  }
})();
