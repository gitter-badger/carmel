'use strict';

$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
};

$.fn.buttonTextWidth = function(text, button) {
	return $.fn.textWidth(text,  $(button).css('font-size') + " " + $(button).css('font-family'));
};

// Common scripts
$.each($('.btn-action'), function(i, button){
		var text        = $(button).text();
		var buttonWidth = $(button).innerWidth();
		var textWidth   = $.fn.buttonTextWidth(text, button);
		while (textWidth + 30 > buttonWidth) {
			var fontSize = $(button).css('font-size');
			fontSize = fontSize.substring(0, fontSize.length - 2);
			fontSize = fontSize - 1;
			fontSize = fontSize + "px";
			$(button).css({'font-size': fontSize});
			textWidth   = $.fn.buttonTextWidth(text, button);
		}
});

//detect browser 
//  var global = {};

//  global.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
//     Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
// var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
// var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
//     // At least Safari 3+: "[object HTMLElementConstructor]"
// var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
// var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

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

