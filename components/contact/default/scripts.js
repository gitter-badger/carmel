module.exports = function ($, app, localeId)  {

  return function($scope, $http, $location, $sce, $timeout) {
      $scope.danger  = false;
      $scope.success = false; 
      $scope.contact = {

        name    : "",
        email   : "",
        message : ""
    
      }

      function clearAlert () {
         $scope.danger  = false;
         $scope.success = false;
         addAttr(); 
      }

      function clearModel () {
        $scope.contact.name    = "";
        $scope.contact.email   = "";
        $scope.contact.message = "";
      }
       
      var nameAttr    = angular.element( document.querySelector( '#name' ));
      var emailAttr   = angular.element( document.querySelector( '#email' ));
      var messageAttr = angular.element( document.querySelector( '#message' ));
      
      function removeAttrib () {
        nameAttr.removeAttr('required');
        emailAttr.removeAttr('required');
        messageAttr.removeAttr('required');
      }

      function addAttr () {
        nameAttr.attr(   'required', "required");
        emailAttr.attr(  'required', "required");
        messageAttr.attr('required', "required");
      }

      $scope.send = function () {

        $timeout(clearAlert, 3000);
        for(var key in $scope.contact) {
          if(!$scope.contact[key] || $scope.contact[key].trim() === "") {
              $scope.danger = true;
            return;
          }
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
