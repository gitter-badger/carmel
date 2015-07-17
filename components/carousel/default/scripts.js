 module.exports = function ($, app, localeId)  {

$('.carousel').carousel({
   interval: 5000
  });
	$('.carousel-control').click(function(e){
		e.preventDefault();
	});

  return function($scope, $http, $location, $sce, $timeout) {

   }
}
