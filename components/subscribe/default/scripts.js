module.exports = function ($, app, localeId, component)  {

  $('#form3 input[type=text], #form3 input[type=email]').on('change invalid', function() {
      var name    = $('#form3 input[type=text]').get(0);
      var email   = $('#form3 input[type=email]').get(0);

      name.setCustomValidity('');
      email.setCustomValidity('');

      if (!name.validity.valid) {
        name.setCustomValidity(component.text.fillName);  
      }
      if (!email.validity.valid) {
        email.setCustomValidity(component.text.fillEmail);  
      }
  });

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
