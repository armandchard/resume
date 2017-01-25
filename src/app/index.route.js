(function () {
  'use strict';

  angular
    .module('mbc')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('profile', {
        url: '/',
        templateUrl: 'app/profile/profile.html',
        controller: 'ProfileController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Profile view'
        }
      })
    $urlRouterProvider.otherwise('/');
  }

})();
