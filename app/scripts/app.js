var bloctime = angular.module("bloctime",  ["ui.router", "firebase"]);

// Set-up

// bloctime.constant('TIME_TASK', 1500);
// bloctime.constant('TIME_BREAK', 300);
// bloctime.constant('TIME_LONG_BREAK', 1800);

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
      
        scope.tasktime = 5;
        scope.buttonText = "Start";
        scope.breakButtonText = "Start break";
        scope.isTimerRunning = false;
        scope.isBreakRunning = false;
        scope.onBreak = false;
        scope.sessionTracker = 0;


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
        scope.tasktime = 5;
        $interval.cancel(scope.timerInterval);
        scope.buttonText = "Start";
      }
    };


    // Sets functionality for break button
    scope.toggleBreak = function() {
      if (scope.isBreakRunning === false) {
        scope.timerInterval = $interval(function(){
          scope.tasktime--;
        }, 1000);
        scope.isBreakRunning = true;
        scope.breakButtonText = "Pause";
      }
      else {
        $interval.cancel(scope.timerInterval);
        scope.isBreakRunning = false;
        scope.breakButtonText = "Restart break";
      }
    };


    // Stops all timer countdowns at 00:00 and sets correct time for task, short break or long break
    scope.expireTimer = function(){
      if (scope.tasktime === 0){
        
        if (scope.sessionTracker <= 3) {
          if (scope.isTimerRunning === true) {
            $interval.cancel(scope.timerInterval);
            scope.isTimerRunning = false;
            scope.onBreak = true;
            scope.tasktime = 3;
            scope.sessionTracker += 1;
            scope.breakButtonText = "Start break";
            scope.buttonText = "Start";
          }
          if (scope.isBreakRunning === true) {
            $interval.cancel(scope.timerInterval);
            scope.onBreak = false;
            scope.isBreakRunning = false;
            scope.tasktime = 5;
            scope.buttonText = "Start";
          }
        }
        
        if (scope.sessionTracker === 4) {
          $interval.cancel(scope.timerInterval);
          scope.onBreak = true;
          scope.tasktime = 8;
          scope.sessionTracker = 0;
          scope.breakButtonText = "Start break";
          scope.buttonText = "Start";
        }

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


    // Changes break button classes based on breadButtonText
    scope.setBreakButtonClass = function() {
      if (scope.breakButtonText === "Start break"){
        return 'animated infinite pulse';
      }
      if (scope.buttonText === "Pause break"){
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