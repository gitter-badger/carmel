'use strict';

	$.each($('.btn-action'), function(i, button){
			var text = $(button).text();
			$(button).text(text.substring(0,15));
		});

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
	$scope.back = function(){
		window.history.back();
	}
}]);
