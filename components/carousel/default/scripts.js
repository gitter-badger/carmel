 module.exports = function ($, app, localeId)  {

  $('.carousel').carousel({
     interval: 5000
    });
  	$('.carousel-control').on("click", function(e){
  		e.preventDefault();
  	});

    $('#Carousel').on('slid.bs.carousel', function () {
      $holder = $( "ol li.active" );
      $holder.removeClass('active');
      var idx = $('div.active').index('div.item');
      $('ol.carousel-indicators li[data-slide-to="'+ idx+'"]').addClass('active');
  });

  $('ol.carousel-indicators  li').on("click",function(){
      $('ol.carousel-indicators li.active').removeClass("active");
      $(this).addClass("active");
  });
  });
  
  return function($scope, $http, $location, $sce, $timeout) {

   }
}
