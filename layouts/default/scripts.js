'use strict';

var app = angular.module('carmel', ['ngSanitize', 'ngRoute']);

app.config(function($interpolateProvider, $routeProvider, $locationProvider) {

  $interpolateProvider.startSymbol('((');
  $interpolateProvider.endSymbol('))');

  $locationProvider.html5Mode({
     enable: true,
     requireBase: false
  });
});

app.controller('MainController', ['$scope', function($scope) {
}]);
