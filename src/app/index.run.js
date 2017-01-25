(function () {
  'use strict';

  angular
    .module('mbc')
    .run(runFunction)
    .run(angularMomentConfig)
    .run(amMoment)

  runFunction.$inject = ['$rootScope', '$state', 'toastr', 'firebaseDataService'];

  function runFunction($rootScope, $state, toastr, firebaseDataService) {
    $rootScope.$on('$routeChangeError', function (event, next, previous, error) {
      if (error === "AUTH_REQUIRED") {
        $state.go('profile');
      }
    });
    $rootScope.$on('$stateChangeStart', function (e, to) {
      if (to.data && to.data.needAdmin) {
        firebaseDataService.getCurrentUser().$loaded(function (user) {
          var currentUser = user;
          if (!currentUser.admin) {
            toastr.error('Vous n\'avez pas les droits nécessaires pour accéder à cette page!');
            $state.go('index.product');
          }
        });
      }
    });
  }

  function amMoment(amMoment) {
    amMoment.changeLocale('fr');
  }

  function angularMomentConfig(angularMomentConfig) {
    angularMomentConfig.preprocess = function (value) {
      return moment(value).locale(moment.locale());
    }
  }

})();
