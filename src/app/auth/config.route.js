(function () {
  'use strict';

  angular
    .module('mbc.auth')
    .config(configFunction)
    .run(runFunction);

  configFunction.$inject = ['$stateProvider'];

  function configFunction($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/auth/login.html',
        controller: 'AuthController',
        controllerAs: 'vm',
        data: { pageTitle: 'Login' },
        resolve: {
          "currentAuth": ["Auth", function(Auth) {
            return Auth.$waitForSignIn();
          }]
        }
      })
      .state('register', {
        url: '/register',
        templateUrl: 'app/auth/register.html',
        controller: 'AuthController',
        controllerAs: 'vm',
        resolve: {
          "currentAuth": ["Auth", function(Auth) {
            return Auth.$waitForSignIn();
          }]
        }
      })
      .state('forgot', {
        url: '/forgot',
        templateUrl: 'app/auth/forgot_password.html',
        controller: 'AuthController',
        controllerAs: 'vm'
      })
  }

  runFunction.$inject = ['$state', 'Auth', 'authService', 'PROTECTED_PATHS'];

  function runFunction($state, Auth, authService, PROTECTED_PATHS) {

    Auth.$onAuthStateChanged(function (authData) {
      if (!authData && pathIsProtected($state.go('profile'))) {
        authService.logout();
      }
    });

    function pathIsProtected(path) {
      return PROTECTED_PATHS.indexOf(path) !== -1;
    }
  }

})();
