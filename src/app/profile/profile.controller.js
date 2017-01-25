(function () {
  'use strict';
  angular.module('mbc.profile')
    .controller('ProfileController', profileController)
    .filter('ageFilter', ageFilter)

  profileController.$inject = ['profileService'];

  function profileController(profileService) {
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

    profileService.getProfile()
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

  }

  function ageFilter() {
    return function (birthday) {
      var birthday = new Date(birthday);
      var today = new Date();
      var age = ((today - birthday) / (31557600000));
      var age = Math.floor(age);
      return age;
    }
  }




})();
