'use strict';
(function () {
  /**
 *
 * Pass all functions into module
 */
  angular
    .module('mbc.core')
    .directive('pageTitle', pageTitle)
    .directive('sideNavigation', sideNavigation)
    .directive('iboxTools', iboxTools)
    .directive('sparkline', sparkline)
    .directive('icheck', icheck)
    .directive('ionRangeSlider', ionRangeSlider)
    .directive('chatSlimScroll', chatSlimScroll)
    .directive('customValid', customValid)
    .directive('fullScroll', fullScroll)
    .directive('closeOffCanvas', closeOffCanvas)
    .directive('clockPicker', clockPicker)
    .directive('landingScrollspy', landingScrollspy)
    .directive('fitHeight', fitHeight)
    .directive('slimScroll', slimScroll)
    .directive('truncate', truncate)
    .directive('touchSpin', touchSpin)
    .directive('markdownEditor', markdownEditor);

  /**
   * pageTitle - Directive for set Page title - mata title
   */
  function pageTitle($rootScope, $timeout) {
    return {
      link: function (scope, element) {
        var listener = function (event, toState) {
          // Default title - load on Dashboard 1
          var title = 'My Box Corner | Admin Page';
          // Create your own title pattern
          if (toState.data && toState.data.pageTitle) title = 'My Box Corner | ' + toState.data.pageTitle;
          $timeout(function () {
            element.text(title);
          });
        };
        var rootOn = $rootScope.$on('$stateChangeStart', listener);
        return rootOn;
      }
    }
  }

  /**
   * sideNavigation - Directive for run metsiMenu on sidebar navigation
   */
  function sideNavigation($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element) {
        // Call the metsiMenu plugin and plug it to sidebar navigation
        $timeout(function () {
          element.metisMenu();

        });
      }
    };
  }


  /**
   * iboxTools - Directive for iBox tools elements in right corner of ibox
   */
  function iboxTools($timeout) {
    return {
      restrict: 'A',
      scope: true,
      template: '<div class="ibox-tools" uib-dropdown>'
      + '<a ng-click="showhide()"> <i class="fa fa-chevron-up"></i></a>'
      + '</div>',
      controller: function ($scope, $element) {
        // Function for collapse ibox
        $scope.showhide = function () {
          var ibox = $element.closest('div.ibox');
          var icon = $element.find('i:first');
          var content = ibox.find('div.ibox-content');
          content.slideToggle(200);
          // Toggle icon from up to down
          icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
          ibox.toggleClass('').toggleClass('border-bottom');
          $timeout(function () {
            ibox.resize();
            ibox.find('[id^=map-]').resize();
          }, 50);
        };
        // Function for close ibox
        $scope.closebox = function () {
          var ibox = $element.closest('div.ibox');
          ibox.remove();
        }
      }
    };
  }

  function closeOffCanvas() {
    return {
      restrict: 'A',
      template: '<a class="close-canvas-menu" ng-click="closeOffCanvas()"><i class="fa fa-times"></i></a>',
      controller: function ($scope) {
        $scope.closeOffCanvas = function () {
          angular.element("body").toggleClass("mini-navbar");
        }
      }
    };
  }

  /**
   * sparkline - Directive for Sparkline chart
   */
  function sparkline() {
    return {
      restrict: 'A',
      scope: {
        sparkData: '=',
        sparkOptions: '='
      },
      link: function (scope) {
        scope.$watch(scope.sparkData, function () {
          render();
        });
        scope.$watch(scope.sparkOptions, function () {
          render();
        });
        var render = function () {
          angular.element.sparkline(scope.sparkData, scope.sparkOptions);
        };
      }
    }
  }

  /**
   * icheck - Directive for custom checkbox icheck
   */
  function icheck($timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, element, $attrs, ngModel) {
        return $timeout(function () {
          var value;
          value = $attrs['value'];

          // $scope.$watch($attrs['ngModel'], function (newValue) {
          //   $(element).iCheck('update');
          // })

          return $(element).iCheck({
            checkboxClass: 'icheckbox_square-green',
            radioClass: 'iradio_square-green'

          }).on('ifChanged', function (event) {
            if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
              $scope.$apply(function () {
                return ngModel.$setViewValue(event.target.checked);
              });
            }
            if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
              return $scope.$apply(function () {
                return ngModel.$setViewValue(value);
              });
            }
          });
        });
      }
    };
  }

  /**
   * ionRangeSlider - Directive for Ion Range Slider
   */
  function ionRangeSlider() {
    return {
      restrict: 'A',
      scope: {
        rangeOptions: '='
      },
      link: function (scope, elem) {
        elem.ionRangeSlider(scope.rangeOptions);
      }
    }
  }

  /**
   * chatSlimScroll - Directive for slim scroll for small chat
   */
  function chatSlimScroll($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element) {
        $timeout(function () {
          element.slimscroll({
            height: '234px',
            railOpacity: 0.4
          });

        });
      }
    };
  }

  /**
   * customValid - Directive for custom validation example
   */
  function customValid() {
    return {
      require: 'ngModel',
      link: function (scope, ele, attrs, c) {
        scope.$watch(attrs.ngModel, function () {

          // You can call a $http method here
          // Or create custom validation

          var validText = "Inspinia";

          if (scope.extras == validText) {
            c.$setValidity('cvalid', true);
          } else {
            c.$setValidity('cvalid', false);
          }

        });
      }
    }
  }


  /**
   * fullScroll - Directive for slimScroll with 100%
   */
  function fullScroll($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element) {
        $timeout(function () {
          element.slimscroll({
            height: '100%',
            railOpacity: 0.9
          });

        });
      }
    };
  }

  /**
   * slimScroll - Directive for slimScroll with custom height
   */
  function slimScroll($timeout) {
    return {
      restrict: 'A',
      scope: {
        boxHeight: '@'
      },
      link: function (scope, element) {
        $timeout(function () {
          element.slimscroll({
            height: scope.boxHeight,
            railOpacity: 0.9
          });

        });
      }
    };
  }

  /**
   * clockPicker - Directive for clock picker plugin
   */
  function clockPicker() {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.clockpicker();
      }
    };
  }


  /**
   * landingScrollspy - Directive for scrollspy in landing page
   */
  function landingScrollspy() {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.scrollspy({
          target: '.navbar-fixed-top',
          offset: 80
        });
      }
    }
  }

  /**
   * fitHeight - Directive for set height fit to window height
   */
  function fitHeight() {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.css("height", angular.element(window).height() + "px");
        element.css("min-height", angular.element(window).height() + "px");
      }
    };
  }

  /**
   * truncate - Directive for truncate string
   */
  function truncate($timeout) {
    return {
      restrict: 'A',
      scope: {
        truncateOptions: '='
      },
      link: function (scope, element) {
        $timeout(function () {
          element.dotdotdot(scope.truncateOptions);

        });
      }
    };
  }


  /**
   * touchSpin - Directive for Bootstrap TouchSpin
   */
  function touchSpin() {
    return {
      restrict: 'A',
      scope: {
        spinOptions: '='
      },
      link: function (scope, element, attrs) {
        scope.$watch(scope.spinOptions, function () {
          render();
        });
        var render = function () {
          $(element).TouchSpin(scope.spinOptions);
        };
      }
    }
  }

  /**
   * markdownEditor - Directive for Bootstrap Markdown
   */
  function markdownEditor() {
    return {
      restrict: "A",
      require: 'ngModel',
      link: function (scope, attrs, ngModel) {
        angular.element.markdown({
          savable: false,
          onChange: function (e) {
            ngModel.$setViewValue(e.getContent());
          }
        });
      }
    }
  }
})();
