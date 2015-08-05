module.exports = function ($, app, localeId)  {

   return function($scope, $http, $location, $sce, $timeout) {

     $scope.onEvent = function(event, jsEvent, view) {
       $scope.showModal = true;
       console.log(event);
     }

     $scope.eventSources = [{
       events: [
                   {
                       title    : '8 Voluntari',
                       start    : '2015-09-23T07:00:00+02:00',
                       end      : '2015-09-23T08:00:00+02:00',
                       editable : false,
                       backgroundColor: "#2ecc71",
                       borderColor : "#34495e",
                       textColor : "#ffffff"
                   },
                   {
                       title    : '0 Voluntari',
                       start    : '2015-09-23T08:00:00+02:00',
                       end      : '2015-09-23T09:00:00+02:00',
                       editable : false,
                       backgroundColor: "#c0392b",
                       borderColor : "#34495e",
                       textColor : "#ffffff"
                   },
                   {
                       title    : '2 Voluntari',
                       start    : '2015-09-23T09:00:00+02:00',
                       end      : '2015-09-23T10:00:00+02:00',
                       editable : false,
                       backgroundColor: "#f39c12",
                       borderColor : "#34495e",
                       textColor : "#ffffff"
                   }
              ],
       color: "blue",
       textColor: "white"
     }];

     $scope.uiConfig = {
      calendar: {
        defaultView: 'agendaWeek',
        scrollTime: '07:00:00',
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
