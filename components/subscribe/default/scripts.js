module.exports = function ($, app, localeId)  {

  return function($scope, $http, $location, $sce, $timeout) {
      $scope.danger  = false;
      $scope.success = false;
      $scope.name    = "";
      $scope.email   = "";

      function clearAlert () {
         $scope.danger  = false;
         $scope.success = false;
         addAttr(); 
      }

      function clearModel () {
        $scope.name    = "";
        $scope.email   = "";
      }
       
      var nameAttr    = angular.element( document.querySelector( '#subName' ));
      var emailAttr   = angular.element( document.querySelector( '#subEmail' ));
      
      function removeAttrib () {
        nameAttr.removeAttr('required');
        emailAttr.removeAttr('required');
      }

      function addAttr () {
        nameAttr.attr(   'required', "required");
        emailAttr.attr(  'required', "required");
      }

      $scope.send = function () {

        $timeout(clearAlert, 3000);
       if(!$scope.name && !$scope.email || $scope.name == "" || $scope.email == "") {
          $scope.danger = true;
       }

        if($scope.danger) {
          return;
        }

        $scope.success = true;
        removeAttrib();
        clearModel();
      }  
  }
}
