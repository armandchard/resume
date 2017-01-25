(function() {
  'use strict';

  angular
    .module('mbc.core')
    .constant('PROTECTED_PATHS', ['/products'])
    .constant('CONSTS', {
      version: '1.0.0',
      months: [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre'
      ],
      // apiUrl: 'https://api-mbc-test.herokuapp.com'
      apiUrl: 'https://api-mbc.herokuapp.com'
      // apiUrl: 'https://mbc-api.herokuapp.com'
      // apiUrl: 'https://mbc-api-test.herokuapp.com'
      // apiUrl: 'http://localhost:8080'
    })
})();
