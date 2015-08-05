module.exports = function ($, app, localeId)  {

   return function($scope, $http, $location, $sce, $timeout) {
     $scope.eventSources =
           [
              {
                  title  : 'event1',
                  start  : '2010-01-01'
              },
              {
                  title  : 'event2',
                  start  : '2010-01-05',
                  end    : '2010-01-07'
              },
              {
                  title  : 'event3',
                  start  : '2010-01-09T12:30:00',
                  allDay : false // will make the time show
              }
          ];
   }
}
