(function() {
  'use strict';

  angular
    .module('mbc', [
      'ngAnimate',
      'ngCookies',
      'ngTouch',
      'ngSanitize',
      'ngMessages',
      'ngAria',
      'ngResource',
      'ui.router',
      'ui.bootstrap',
      'ngCsvImport',
      'angular-ladda',
      'toastr',
      'localytics.directives',
      'datatables',
      'textAngular',
      'flow',
      'ui.utils.masks',
      'firebase',
      'AngularPrint',
      'angularMoment',
      'angular-flot',
      'angularTinycon',
      'tmh.dynamicLocale',
      'slick',
      // 'wu.masonry',
      // 'infinite-scroll',

      //////

      'mbc.core',
      'mbc.auth',
      // 'mbc.admin',
      'mbc.layout',
      // 'mbc.stock',
      // 'mbc.basket',
      // 'mbc.refill',
      'mbc.profile',
      // 'mbc.product',
      // 'mbc.project',
      // 'mbc.dashboard',
      // 'mbc.notification'
    ]);

})();
