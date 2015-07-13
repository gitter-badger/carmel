module.exports = function ($, app)  {

  return function($scope, $http, $location, $sce) {

    var urlPath     = window.location.pathname;
    var urlParts    = urlPath.split('/');

    if (!urlParts || urlParts.length < 3 || !urlParts[2]){
      return;
    }

    var idAndSlug   = urlParts[2].split('-');

    if (!idAndSlug || idAndSlug.length < 2 || !idAndSlug[0] || !idAndSlug[1]) {
      return;
    }

    var articleId   = idAndSlug[0];
    var articleSlug = idAndSlug[1];

    $http.get('/data/articles/' + articleId + '.html').
      success(function(data, status, headers, config) {
        $scope.article = $sce.trustAsHtml(data);
      }).
      error(function(data, status, headers, config) {
      });
   }
}
