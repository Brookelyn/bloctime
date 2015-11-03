var bloctime = angular.module("bloctime",  ["ui.router", "firebase"]);

// Set-up

// Homepage controller

bloctime.controller('mainCtlr', function($scope, $interval) {

  // var fbRef = new Firebase("https://brookelyn-bloctime.firebaseio.com/tasks");

  // $scope.tasks = $firebaseArray(fbRef);

  $scope.timerInterval = null;



});



bloctime.directive('clock', ['$interval',  function($interval) {
  return {
    templateUrl: '/templates/clock.html',
    restrict: 'E',
    scope: true,
    link: function(scope, element, attributes) {
      
        scope.tasktime = 1500;
        scope.isTimerRunning = false;
        scope.buttonText = "Start";


    // Sets functionality for start/reset timer button
    scope.toggleTimer = function() {
      if (scope.isTimerRunning === false) {
        
        scope.timerInterval = $interval(function(){
          scope.tasktime--;
        }, 1000);

        scope.isTimerRunning = true;
        scope.buttonText = "Reset";
      }
      else {
        scope.isTimerRunning = false;
        scope.tasktime = 1500;
        $interval.cancel(scope.timerInterval);
        scope.buttonText = "Start";
      }
    };

    // Changes button classes based on buttonText

    scope.setButtonClass = function() {
      if (scope.buttonText === "Start"){
        return 'animated infinite pulse';
      }
      if (scope.buttonText === "Reset"){
        return '';
      }
    };



    


    }
  }
}]);


// Converts seconds display to seconds and minutes
bloctime.filter('timeconvert', function() {
  return function(seconds){
    
    seconds = Number.parseFloat(seconds);
    
    if (Number.isNaN(seconds)){
      return '--:--'; 
    }

    var wholeSeconds = Math.floor(seconds);
    var minutes = Math.floor(wholeSeconds / 60);
    var remainingSeconds = wholeSeconds % 60;
    var output = minutes + ':';
    
    if (remainingSeconds < 10) {
      output += '0';
    }

    output += remainingSeconds;
    return output;
  }
});