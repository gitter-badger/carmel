module.exports = function ($, app, localeId)  {

  return function($scope, $http, $location, $sce, $timeout) {
      $scope.danger  = false;
      $scope.success = false; 
      $scope.contact = {

        name    : "",
        email   : "",
        message : ""
    
      }

      function clearAlert (){
         $scope.danger  = false;
         $scope.success = false; 
      }

      function clearModel (){
        $scope.contact.name    = "";
        $scope.contact.email   = "";
        $scope.contact.message = "";
      }
   
      function removeAttrib (){
        var nameAttr    = angular.element( document.querySelector( '#name' ) );
        var emailAttr   = angular.element( document.querySelector( '#email' ) );
        var messageAttr = angular.element( document.querySelector( '#message' ) );

        nameAttr.removeAttr('required');
        emailAttr.removeAttr('required');
        messageAttr.removeAttr('required');
      }

      $scope.send = function(){

        $timeout(clearAlert, 3000);

        if(!$scope.contact.name && !$scope.contact.email && !$scope.contact.message ||  $scope.contact.name == "" || $scope.contact.email == "" || $scope.contact.message == "") {
          
          $scope.danger  = true;

        }else{

          $scope.success = true;
          removeAttrib();
          clearModel();

        }
      }
  			
     
   
    }
}
