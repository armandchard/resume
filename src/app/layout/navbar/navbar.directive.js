(function () {
  'use strict';

  angular
    .module('mbc.layout')
    .directive('gzNavbar', gzNavbar)

  function gzNavbar() {
    return {
      templateUrl: 'app/layout/navbar/navbar.html',
      restrict: 'E',
      scope: {},
      controller: NavbarController,
      controllerAs: 'vm'
    };
  }

  NavbarController.$inject = ['$http', 'CONSTS', '$state', 'authService', 'firebaseDataService', '$firebaseArray', 'anTinycon', 'toastr'];

  function NavbarController($http, CONSTS, $state, authService, firebaseDataService, $firebaseArray, anTinycon, toastr) {
    var vm = this;
    vm.isLoggedIn = authService.isLoggedIn;
    vm.markAsRead = markAsRead;
    vm.logout = logout;
    vm.currentUser = authService.getUser;

    vm.unreadNotifications = 0;
    vm.notifications = [];
    vm.group = [];

    firebaseDataService.getCurrentUser()
      .$loaded(function (user) {
        vm.profile = user;
        $firebaseArray(firebase.database().ref('notifications/' + user.$id))
          .$loaded(function (data) {
            vm.notifications = data;
            vm.group = _.groupBy(vm.notifications, 'type');
            vm.totalUnread = _.filter(vm.notifications, 'unread');
            if (vm.totalUnread.length > 0) {
              anTinycon.setBubble(vm.totalUnread.length);
            }
            vm.unreadGroup = _.groupBy(vm.totalUnread, 'type');
            vm.notifications.$watch(function (data) {
              if (data.event === "child_added" || data.event === "child_changed") {
                vm.totalUnread = _.filter(vm.notifications, 'unread');
                vm.unreadGroup = _.groupBy(vm.totalUnread, 'type');
                if (vm.totalUnread.length > 0) {
                  anTinycon.setBubble(vm.totalUnread.length);
                }
              }
            })
          })
      });

    firebaseDataService.getVersion()
      .$loaded(function (version) {
        version.$watch(function (data) {
          if (CONSTS.version !== version.$value) {
            var options = {
              allowHtml: true,
              closeButton: false,
              positionClass: "toast-bottom-left",
              timeOut: 0,
              extendedTimeOut: 0,
              onHidden: function() {
                window.location.reload(true);
              }
            };
            toastr.info('<a style="color:#e8455e" href="javascript:window.location.reload(true)"><strong>Actualiser pour la découvrir</strong></a>', 'Une nouvelle version est disponible', options);
          }
        });
      })

    function logout() {
      authService.logout();
      $state.go('profile');
    }

    function markAsRead(open) {
      if (!open) {
        for (var i = 0; i < vm.totalUnread.length; i++) {
          vm.totalUnread[i].unread = false;
          vm.notifications.$save(vm.totalUnread[i]);
        }
        anTinycon.reset();
      }
    }

  }

})();
