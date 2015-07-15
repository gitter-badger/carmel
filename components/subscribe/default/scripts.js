module.exports = function ($, app, localeId)  {

  return function($scope, $http, $location, $sce, $timeout) {

  	$scope.name          = "";
  	$scope.email         = "";
	  $scope.warning       = false;
  	$scope.success       = false;
    $scope.emailDanger   = false;

  	function cleanAlert() {
  		$scope.warning     = false;
  		$scope.success     = false;
      $scope.emailDanger = false;
  	}

		

  	$scope.subscribe = function(){
      
      $timeout(cleanAlert, 3000);
  		 
      if(!$scope.name && !$scope.email || $scope.name == "" || $scope.email  == "" || $scope.email == undefined){
   			
        $scope.warning     = true;
        $scope.emailDanger = true;
        $scope.emailAlert  = 'Please include "@" in email fild';
  		
      }else {
  			$scope.success  = true;
        $scope.name     = "";
        $scope.email    = "";
        
  		}
      


    		// $http.post('/someUrl', {name:$scope.name, email:$scope.email}).
      // success(function(data, status, headers, config) {
      //   // this callback will be called asynchronously
      //   // when the response is available
      //   console.log(data);
      // }).
      // error(function(data, status, headers, config) {
      //   // called asynchronously if an error occurs
      //   // or server returns response with an error status.
      //   console.log(status);
      // });
  		
  	}
			
   }
}
