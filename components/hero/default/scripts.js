module.exports = function ($, app, localeId)  {

  $("#hero-details").on('click', function (e){
    e.preventDefault();
    $('html, body').animate({
        scrollTop: $(".carmel-summary-default").offset().top - 50
    }, 600);
  });
   
  return function($scope, $http, $location, $sce, $timeout) {


   }
}
