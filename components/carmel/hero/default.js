(function(){
  'use strict';

  var app = {
    start: function(){
      var height = $(window).height();
      $('#hero').css('height', height + 'px');
      var h = $("#hero-container").height();
      var padding = (height - h) / 2;
      $("#hero-container").css({
        'position': 'absolute',
        'left' : '0',
        'right': '0',
        'top': padding,
        'bottom': padding
      });
    },

    load: function(){
      $('#hero-details').on('click', function(event) {
        var target = $('#details');
        if( target.length ) {
          event.preventDefault();
          $('html, body').animate({
            scrollTop: target.offset().top
          }, 500);
        }
      });
    }
  };

//  app.start();

  $(document).ready(function(){
    app.load();
  });

  $(window).on('resize', function(){
    location.reload();
  });

})();
