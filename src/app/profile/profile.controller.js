(function () {
  'use strict';
  angular.module('mbc.profile')
    .controller('ProfileController', profileController)
    .filter('ageFilter', ageFilter)

  profileController.$inject = ['$state', '$stateParams', 'profileService'];

  function profileController($state, $stateParams, profileService) {
    var vm = this;
    vm.loading = true;
    var colors = ['#2196F3', '#FF9800', '#FF5722', '#689F38', '#E91E63', '#F44336'];
    vm.options = {
      size: 100,
      readOnly: true,
      displayInput: false,
      trackWidth: 50,
      barWidth: 50,
      trackColor: '#B0BEC5',
      barColor: '#2196F3'
      // trackColor: '#B0BEC5',
      // barColor: getColors(0)
    };
    vm.interval = 3000;
    vm.activeSlide = 0;

    profileService.getProfile($stateParams.lang)
      .$loaded(function (data) {
        vm.profile = data;
        vm.loading = false;
      })

    function getColors(index) {
      if (index < colors.length) {
        return colors[index];
      } else {
        return colors[index - colors.length];
      }
    }

    vm.getOptions = function (index) {
      return {
        size: 100,
        readOnly: true,
        displayInput: false,
        trackWidth: 50,
        barWidth: 50,
        trackColor: '#B0BEC5',
        barColor: getColors(index)
      }
    }

    vm.changeLanguage = function (lang){
      $state.go('profile', {lang: lang});
    }

  }

  function ageFilter() {
    return function (bday) {
      var birthday = new Date(bday);
      var today = new Date();
      var age = ((today - birthday) / (31557600000));
      return Math.floor(age);
    }
  }




})();
