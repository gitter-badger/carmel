module.exports = function ($, app, localeId)  {

   return function($scope, $http, $location, $sce, $timeout) {

     $scope.onEvent = function(event, jsEvent, view) {
       $scope.showModal = true;
       console.log(event);
     }

     $scope.eventSources = [{
       events: [
                   {
                       title    : '0 voluntari',
                       start    : '2015-09-23T07:00:00+02:00',
                       end      : '2015-09-23T08:00:00+02:00',
                       editable : false,
                       backgroundColor : "#c0392b",
                       borderColor : "#34495e",
                       textColor : "#ffffff"
                   },
                   {
                       title    : '0 voluntari',
                       start    : '2015-09-23T08:00:00+02:00',
                       end      : '2015-09-23T09:00:00+02:00',
                       editable : false,
                       backgroundColor : "#c0392b",
                       borderColor : "#34495e",
                       textColor : "#ffffff"
                   }
              ]
     }];

     $scope.uiConfig = {
      calendar: {
        height: "auto",
        defaultView: 'agendaWeek',
        minTime: '07:00:00',
        maxTime: '19:00:00',
        allDaySlot: false,
        editable: false,
        header:{
          left: 'title',
          center: '',
          right: 'prev,next'
        },
        eventClick: $scope.onEvent,
      }
    };


   }
}
