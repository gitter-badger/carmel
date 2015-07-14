module.exports = function ($, app, localeId)  {

  return function($scope, $http) {
    $scope.tags = [];

    $http.get('/' + (localeId ? localeId  + '/': '') + 'data/articles/tags.json').
      success(function(data, status, headers, config) {
        data.forEach(function(tag){
          $scope.tags.push({title: tag.tag, link: "tag-" + tag.tag});
        });
      }).
      error(function(data, status, headers, config) {
      });

   }
}
