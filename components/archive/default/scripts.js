module.exports = function ($, app, localeId)  {

  return function($scope, $http, $location, $sce, $timeout) {
    var allArticles         = [];
    var articles            = [];

    $scope.articles         = [];
    $scope.perPage          =  3;
    $scope.page             =  1;
    $scope.totalArticles    =  0;
    $scope.totalPages       =  0;
    $scope.showArticles     = false;
    $scope.showButtons      = true;
    $scope.tags             = [];

    function showTags () {
        $http.get('/' + (localeId ? localeId  + '/': '') + 'data/articles/tags.json').
          success(function(data, status, headers, config) {
            data.forEach(function(tag) {
              $scope.tags.push({title: tag.tag, totalArticles: tag.articles.length, articles: tag.articles});
            });
            $scope.tags.unshift({title: 'all', totalArticles: allArticles.length});
            $scope.showArticles = true;
          }).
          error(function(data, status, headers, config) {
          });
    }

    function showArticles (tag) {
      var start = ($scope.page-1) * $scope.perPage;
      var end = ($scope.page-1) * $scope.perPage + $scope.perPage;
      $scope.articles = articles.slice(start, end);
    }

    $scope.showTag = function(tag) {
        $scope.page = 1;

        if (tag.articles) {
          articles = [];
          tag.articles.forEach(function(articleMeta) {
            allArticles.forEach(function(article) {
                if (article.id === articleMeta.articleId) {
                    articles.push(article);
                }
            });
          });
        } else {
          articles = allArticles;
        }

        $scope.totalArticles = articles.length;
        $scope.totalPages    = Math.ceil($scope.totalArticles / $scope.perPage);

        showArticles();
    }

    $scope.fetchOlder = function() {
      if (!$scope.hasOlder()) {
        return;
      }

      $scope.page = $scope.page + 1;
      showArticles();
    }

    $scope.fetchNewer = function () {
      if (!$scope.hasNewer()) {
        return;
      }

      $scope.page = $scope.page - 1;
      showArticles();
    }

    $scope.hasOlder = function() {
      return ($scope.page < $scope.totalPages);
    }

    $scope.hasNewer = function() {
      return ($scope.page > 1);
    }

    $http.get('/' + (localeId ? localeId  + '/': '') + 'data/articles/all.json').
      success(function(data, status, headers, config) {
        allArticles           = data;
        articles              = allArticles;
        $scope.page           = 1;
        $scope.tags           = [];
        $scope.totalArticles  = articles.length;
        $scope.totalPages     = Math.ceil($scope.totalArticles / $scope.perPage);

        showArticles();
        showTags();
      }).
      error(function(data, status, headers, config) {
      });
   }
}
