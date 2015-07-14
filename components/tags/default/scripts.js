module.exports = function ($, app, localeId)  {

  return function($scope, $http) {

    $http.get('/' + (localeId ? localeId  + '/': '') + 'data/articles/tags.json').
      success(function(data, status, headers, config) {
        $scope.tags= data;
        console.log(data);

      }).
      error(function(data, status, headers, config) {
      });


   }
}
