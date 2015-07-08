'use strict';

var app = angular.module('carmel', []);

app.config(function($interpolateProvider){
  $interpolateProvider.startSymbol('((');
  $interpolateProvider.endSymbol('))');
});

app.controller('MainController', ['$scope', function($scope) {
}]);
