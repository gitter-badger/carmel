module.exports = function ($, app, localeId, component)  {

  $('.carousel').carousel({
    interval: 2000
  });
  $('.carousel-control').click(function(e){
    e.preventDefault();
  });

  return function($scope, $http, $location, $sce, $timeout) {

  }
}
