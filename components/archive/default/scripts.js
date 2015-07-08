module.exports = function ($, app)  {

  return function($scope, $http) {

    $http.get('/data/articles.json').
      success(function(data, status, headers, config) {
        $scope.articles = data;
      }).
      error(function(data, status, headers, config) {

    });
  }
}
