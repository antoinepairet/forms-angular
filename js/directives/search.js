'use strict';

formsAngular.controller('SearchCtrl', ['$scope', '$location', 'routingService', 'SubmissionsService',
    function ($scope, $location, routingService, SubmissionsService) {

  var currentRequest = '';

  $scope.handleKey = function (event) {
    if (event.keyCode === 27 && $scope.searchTarget.length > 0) {
      $scope.searchTarget = '';
    } else if ($scope.results.length > 0) {
      switch (event.keyCode) {
        case 38:
          // up arrow pressed
          if ($scope.focus > 0) {
            $scope.setFocus($scope.focus - 1);
          }
          if (typeof event.preventDefault === 'function') { event.preventDefault(); }
          break;
        case 40:
          // down arrow pressed
          if ($scope.results.length > $scope.focus + 1) {
            $scope.setFocus($scope.focus + 1);
          }
          if (typeof event.preventDefault === 'function') { event.preventDefault(); }
          break;
        case 13:
          if ($scope.focus != null) {
            $scope.selectResult($scope.focus);
          }
          break;
      }
    }
  };

  $scope.setFocus = function (index) {
    if ($scope.focus !== null) { delete $scope.results[$scope.focus].focussed; }
    $scope.results[index].focussed = true;
    $scope.focus = index;
  };

  $scope.selectResult = function (resultNo) {
    var result = $scope.results[resultNo];
    
    routingService.redirectTo('edit', result.resource, undefined, result.id);
  };

  $scope.resultClass = function (index) {
    var resultClass = 'search-result';
    if ($scope.results && $scope.results[index].focussed) { resultClass += ' focus'; }
    return resultClass;
  };

  var clearSearchResults = function () {
    $scope.moreCount = 0;
    $scope.errorClass = '';
    $scope.results = [];
    $scope.focus = null;
  };

  $scope.$watch('searchTarget', function (newValue) {
    if (newValue && newValue.length > 0) {
      currentRequest = newValue;

      var modelStr = '';
      var options = {};
      if (typeof $scope.fngModel !== 'undefined' && $scope.fngModel !== '') {
        modelStr = '/' + $scope.fngModel;
      }
      if (typeof $scope.fngLimit !== 'undefined' && $scope.fngLimit !== '') {
        options.limit = $scope.fngLimit;
      }
      if (typeof $scope.fngFilter !== 'undefined' && $scope.fngFilter !== '') {
        options.find = $scope.fngFilter;
      }
      //if (typeof $scope.fngAggregate !== 'undefined' && $scope.fngAggregate !== '') {
      //  options.aggregate = $scope.fngAggregate;
      //}
      if (typeof $scope.fngOrder !== 'undefined' && $scope.fngOrder !== '') {
        options.order = $scope.fngOrder;
      }
      if (typeof $scope.fngSkip !== 'undefined' && $scope.fngSkip !== '') {
        options.skip = $scope.fngSkip;
      }

      SubmissionsService.searchPagedAndFilteredList(options).success(function (data) {
        // Check that we haven't fired off a subsequent request, in which
        // case we are no longer interested in these results
        if (currentRequest === newValue) {
          if ($scope.searchTarget.length > 0) {
            $scope.results = data.results;
            $scope.moreCount = data.moreCount;
            if (data.results.length > 0) {
              $scope.errorClass = '';
              $scope.setFocus(0);
            }
            $scope.errorClass = $scope.results.length === 0 ? 'error' : '';
          } else {
            clearSearchResults();
          }
        }
      }).error(function (data, status) {
        console.log('Error in searchbox.js : ' + data + ' (status=' + status + ')');
      });
    } else {
      clearSearchResults();
    }
  }, true);

  $scope.$on('$routeChangeStart', function () {
    $scope.searchTarget = '';
  });

}])
  .directive('globalSearch', ['cssFrameworkService', function (cssFrameworkService) {
    return {
      restrict: 'AE',
        scope: {
            fngModel: '=',
            fngFilter: '=',
            fngLimit: '=',
            fngOrder: '=',
            fngSkip: '='
        },
      templateUrl: 'template/search-' + cssFrameworkService.framework() + '.html',
      controller: 'SearchCtrl'
    };
  }
  ]);
