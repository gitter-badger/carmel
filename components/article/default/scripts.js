module.exports = function ($, app, localeId)  {


  return function($scope, $http, $location, $sce) {

    var urlPath       = window.location.pathname;
    var urlParts      = urlPath.split('/');
    var partsExpected = (localeId ? 4 : 3);

    if (!urlParts || urlParts.length < partsExpected || !urlParts[partsExpected - 1]){
      return;
    }

    var idAndSlug   = urlParts[partsExpected-1].split('-');

    if (!idAndSlug || idAndSlug.length < 2 || !idAndSlug[0] || !idAndSlug[1]) {
      return;
    }

    var articleId   = idAndSlug[0];
    var articleSlug = idAndSlug[1];

    var dataUrl = '/' + (localeId ? localeId  + '/': '') + 'data/articles/' +  articleId;

    console.log(dataUrl);

    $http.get(dataUrl + '.html').
      success(function(data, status, headers, config) {
        $scope.article.body = $sce.trustAsHtml(data);
      }).
      error(function(data, status, headers, config) {
      });

  $http.get(dataUrl + '.json').
     success(function(data, status, headers, config) {
       $scope.article.meta = data;
     }).
     error(function(data, status, headers, config) {
     });
   }
}
