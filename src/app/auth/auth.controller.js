(function() {
  'use strict';

  angular
    .module('mbc.auth')
    .controller('AuthController', AuthController);

  AuthController.$inject = ['$state', 'authService'];

  function AuthController($state, authService) {
    var vm = this;

    vm.error = null;

    vm.register = register;
    vm.resetPassword = resetPassword;
    vm.login = login;

    function register(user) {
      return authService.register(user)
        .then(function() {
          return vm.login(user);
        })
        .catch(function(error) {
          vm.error = error;
        });
    }

    function login(user) {
      return authService.login(user)
        .then(function() {
          $state.go('index.dashboard');
        })
        .catch(function(error) {
          vm.error = error;
        });
    }

    function resetPassword(email) {
      return authService.resetPassword(email)
        .then(function() {
          $state.go('login');
        })
        .catch(function(error) {
          vm.error = error;
        });
    }
  }

})();
