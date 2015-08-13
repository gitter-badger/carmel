module.exports = function ($, app, localeId, component)  {

  $("#hero-details").on('click', function (e){
    e.preventDefault();
    $('html, body').animate({
        scrollTop: $(".carmel-summary-default").offset().top - 20
    }, component.variables.animationDuration);
  });

  return function($scope, $http, $location, $sce, $timeout) {
  }
}
