module.exports = function ($, app, localeId)  {

  return function($scope, $http) {
    var allArticles         = [];

    $scope.articles         = [];
    $scope.perPage          =  3;
    $scope.page             =  1;
    $scope.totalArticles    =  0;
    $scope.totalPages       =  0;
    $scope.showArticles     = false;

    function update () {
      var start = ($scope.page-1) * $scope.perPage;
      var end = ($scope.page-1) * $scope.perPage + $scope.perPage;
      $scope.articles = allArticles.slice(start, end);
    }

    $scope.fetchOlder = function() {
      if (!$scope.hasOlder()) {
        return;
      }

      $scope.page = $scope.page + 1;
      update();
    }

    $scope.fetchNewer = function () {
      if (!$scope.hasNewer()) {
        return;
      }

      $scope.page = $scope.page - 1;
      update();
    }

    $scope.hasOlder = function() {
      return ($scope.page < $scope.totalPages);
    }

    $scope.hasNewer = function() {
      return ($scope.page > 1);
    }

    $scope.tags = [];

    $http.get('/' + (localeId ? localeId  + '/': '') + 'data/articles/tags.json').
      success(function(data, status, headers, config) {
        data.forEach(function(tag){
          $scope.tags.push({title: tag.tag, link: "tag-" + tag.tag});
        });
      }).
      error(function(data, status, headers, config) {
      });

    $http.get('/' + (localeId ? localeId  + '/': '') + 'data/articles/all.json').
      success(function(data, status, headers, config) {
        allArticles           = data;
        $scope.page           = 1;
        $scope.totalArticles  = allArticles.length;
        $scope.showArticles   = true;
        $scope.totalPages     = Math.ceil($scope.totalArticles / $scope.perPage);

        update();
      }).
      error(function(data, status, headers, config) {
      });
   }
}
