module.exports = function ($, app)  {

  return function($scope) {

    $scope.articles = [
                       {
                           link: "http://localhost:9001/",
                           image: "https://download.unsplash.com/photo-1434139240289-56c519f77cb0",
                           title: "The Title",
                           date: "7-May-2015",
                           body: "The Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore, sed do eiusmod tempor incididunt ut labore et dolore"
                       },
                       {
                           link: "http://localhost:9001/",
                           image: "https://download.unsplash.com/photo-1433959352364-9314c5b6eb0b",
                           title: "The Title",
                           date: "7-May-2015",
                           body: "The Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore, sed do eiusmod tempor incididunt ut labore et dolore"
                       },
                       {
                           link: "http://localhost:9001/",
                           image: "https://download.unsplash.com/photo-1433838552652-f9a46b332c40",
                           title: "The Title",
                           date: "7-May-2015",
                           body: "The Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore, sed do eiusmod tempor incididunt ut labore et dolore"
                       }
                   ];
  }
}
