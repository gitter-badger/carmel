module.exports = function ($, app, localeId)  {

  var time = 50;
  $(window).scroll(function() {
    if ($(document).scrollTop() > 50) {
      $('.carmel-navbar-default nav').stop().animate({
        height : '56px',
        top : '0'
      }, time);
      $('.navbar .navbar-nav li a').stop().animate({
        padding : '10px'
      }, time);
      $('.navbar .navbar-nav').stop().animate({
        padding : '5px'
      }, time);
      $('.navbar .navbar-brand').stop().animate({
        padding : '5px'
      }, time);


    } else {
      $('.carmel-navbar-default nav').stop().animate({
        height : '72px',
        top : '2rem'
      }, time);
      $('.navbar .navbar-nav li a').stop().animate({
        padding : '14px'
      }, time);
      $('.navbar .navbar-nav').stop().animate({
        padding : '10px'
      }, time);
      $('.navbar .navbar-brand').stop().animate({
        padding : '10px'
      }, time);
    }
  });


  return function($scope, $http) {

   }
}
