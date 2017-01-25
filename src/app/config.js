(function () {
  'use strict';

  angular
    .module('mbc')
    .config(firebaseConfig)

  function firebaseConfig() {
    var config = {
    apiKey: "AIzaSyBAgfwjqXO3gXn97-tixnb7Ad1HrPkcr8Y",
    authDomain: "ac-resume.firebaseapp.com",
    databaseURL: "https://ac-resume.firebaseio.com",
    storageBucket: "ac-resume.appspot.com",
    messagingSenderId: "193063896795"
  };
    firebase.initializeApp(config);
  }

})();
