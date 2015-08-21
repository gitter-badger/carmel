module.exports = function ($, app, localeId)  {

  return function($scope, $http, $location, $sce, $timeout) {

    $scope.cities = [
      {
       image : "http://www.ultimele-stiri.eu/images/ultimele-stiri.eu/city/share/cluj.jpg",
       name : "Cluj Napoca",
       description : "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
     },
     {
       image : "http://www.stiridinvest.ro/wp-content/uploads/2014/02/timisoara.jpg",
       name : "Timisoara",
       description : "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
     }
    ];


    //select element by ID
    var rmCLass = angular.element( document.querySelector( '#show' ));

    //add an event
    $scope.show = function() {
      //removeClass
      rmCLass.removeClass('hide');

      //add class
      $scope.class = "hide";
    };

   }
}
