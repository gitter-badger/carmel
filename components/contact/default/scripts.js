module.exports = function ($, app, localeId, component)  {

  $('#form2 input[type=text], #form2 input[type=email], #form2 textarea').on('change invalid', function() {
      var name    = $('#form2 input[type=text]').get(0);
      var email   = $('#form2 input[type=email]').get(0);
      var message = $('#form2 textarea').get(0);
      name.setCustomValidity('');
      email.setCustomValidity('');
      message.setCustomValidity('');

      if (!name.validity.valid) {
        name.setCustomValidity(component.text.fillName);  
      }
      if (!email.validity.valid) {
        email.setCustomValidity(component.text.fillEmail);  
      }
      if (!message.validity.valid) {
        message.setCustomValidity(component.text.fillMessage);  
      }
  });



  return function($scope, $http, $location, $sce, $timeout) {
      $scope.danger  = false;
      $scope.success = false;
      $scope.contact = {

        name    : "",
        email   : "",
        message : "",
        context : component.variables.context
      }

      var data = $scope.contact; 
      
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


        $http.post('http://carmel.io/api/messages', data).
          success(function(data, status, headers, config) {


          $scope.success = true;
          removeAttrib();
          clearModel();
            // this callback will be called asynchronously
           // when the response is available
        }).
        error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          $scope.danger = true;
          
        });

        
      }
       
      $scope.questions = component.variables.questions;
     
  }
}
