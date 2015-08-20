module.exports = function ($, app, localeId)  {

  return function($scope, $http, $location, $sce, $timeout) {

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
