(function () {
  'use strict';

  angular
    .module('mbc.auth')
    .factory("Auth", auth)
    .factory('authService', authService)

  auth.$inject = ['$firebaseAuth'];

  function auth($firebaseAuth) {
    return $firebaseAuth();
  }

  authService.$inject = ['Auth'];

  function authService(Auth) {
    var service = {
      register: register,
      login: login,
      logout: logout,
      updateEmail: updateEmail,
      updatePassword: updatePassword,
      resetPassword: resetPassword,
      isLoggedIn: isLoggedIn,
      getUser: getUser
    };
    return service;

    function register(user) {
      return Auth.$createUserWithEmailAndPassword(user.email, user.password);
    }

    function login(user) {
      return Auth.$signInWithEmailAndPassword(user.email, user.password);
    }

    function logout() {
      Auth.$signOut();
    }

    function updateEmail(email) {
      return Auth.$updateEmail(email);
    }

    function updatePassword(password) {
      return Auth.$updatePassword(password);
    }

    function resetPassword(email) {
      return Auth.$sendPasswordResetEmail(email);
    }

    function isLoggedIn() {
      return Auth.$getAuth();
    }

    function getUser() {
      return Auth.$getAuth();
    }

  }

})();
