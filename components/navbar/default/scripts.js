module.exports = function ($, app, localeId, component)  {
 
  $window         = $(window).width();
  var topbar      = $('.carmel-topbar-default .container-fluid');
  var time        = 50;
  var top         = topbar.outerHeight();
  var bgColor     = $('.carmel-navbar-default .navbar');
  var scrollColor = $('.hero-image').css('background-color') || "black";
    
  $('.carmel-navbar-default nav').css("top", top);

  $(window).scroll(function() {
    if ($(document).scrollTop() > 50) {
      $('.carmel-navbar-default nav').stop().animate({
            height : '56px',
            top : '0'
        }, time);
        if(bgColor.css('background-color') == "rgba(0, 0, 0, 0)") {
         
            bgColor.css({
              background : scrollColor
            });   
        }
      
      
      $('.carmel-navbar-default .navbar .navbar-brand img').stop().animate({
        height : '45px'
      }, time);

      if ($window < 750) {
        $('#navbar-collapse').css({
          position: 'relative',
          top      : '-10px'
        });
      }
      $('.navbar .navbar-nav li a').stop().animate({
        padding : '10px'
      }, time);
      $('.navbar .navbar-nav').stop().animate({
        padding : '5px'
      }, time);
      $('.navbar .navbar-header button').stop().animate({
        height : '38px'
      }, time);

    } else {
      $('.carmel-navbar-default nav').stop().animate({
          height : '72px',
          top : top
      }, time);

      $('.carmel-navbar-default .navbar').css({
              background : ''
      }); 
        
      $('.carmel-navbar-default .navbar .navbar-brand img').stop().animate({
        height : '60px'
      }, time);

      if (!$window < 750) {
        $('#navbar-collapse').css({
          position: 'relative',
          top      : 0
        });
      }
      $('.navbar .navbar-nav li a').stop().animate({
        padding : '14px'
      }, time);
      $('.navbar .navbar-nav').stop().animate({
        padding : '10px'
      }, time);
      $('.navbar .navbar-header button').stop().animate({
        height : '44px'
      }, time);

    }
  });


  return function($scope, $http, $location, $sce, $timeout) {

   }
}
