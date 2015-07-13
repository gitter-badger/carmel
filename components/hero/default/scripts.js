module.exports = function ($, app, localeId)  {

  $("#hero-details").on('click', function (e){
    e.preventDefault();
    $('html, body').animate({
        scrollTop: $(".carmel-summary-default").offset().top - 50
    }, 1000);
  });


  return function($scope, $http) {

   }
}
