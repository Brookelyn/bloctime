var bloctime = angular.module("bloctime",  ["ui.router", "firebase"]);


// Set-up

bloctime.constant('TIME_TASK', 1500);
bloctime.constant('TIME_BREAK', 300);
bloctime.constant('TIME_LONG_BREAK', 1800);


bloctime.config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider.state('home', {
    url: '/',
    controller: 'mainCtlr',
    templateUrl: '/templates/home.html'
  });

  
}]);


// Firebase factory to handle task list

bloctime.factory('Task', ['$firebaseArray', function($firebaseArray) {
  var fbRef = new Firebase("https://brookelyn-bloctime.firebaseio.com/tasks");
  var tasks = $firebaseArray(fbRef);

  return {
    add: function(task) {
      var addTask = tasks.$add({
        name: task.text,
        date: Firebase.ServerValue.TIMESTAMP,
        completed: false
      });
      return addTask;
    },
    delete: function(task) {
      return tasks.$remove(task);
    },
    all: function() {
      return tasks;
    }
  }

}]);


// Homepage controller

bloctime.controller('mainCtlr', function($scope, Task) {
  
  $scope.tasks = Task.all();

  var menuClass = false;

  $scope.addTask = function() {
    Task.add($scope.task);
    $scope.task = {};
  }

  $scope.deleteTask = function(task) {
    Task.delete(task).then(function(ref) {
      if (ref.key() === task.$id) {
        // success
      } else {
        // failure
      }
    })
  };

  
  $('#slide-click').click(function(){
    $('#task-slider').slideToggle('slow');
  });

  


});



bloctime.directive('clock', ['$interval', 'TIME_TASK', 'TIME_BREAK', 'TIME_LONG_BREAK',
  function($interval, TIME_TASK, TIME_BREAK, TIME_LONG_BREAK) {

  return {
    templateUrl: '/templates/clock.html',
    restrict: 'E',
    scope: true,
    link: function(scope, element, attributes) {
        
        var mySound = new buzz.sound("http://soundbible.com/mp3/Japanese%20Temple%20Bell%20Small-SoundBible.com-113624364", {
          formats: ['mp3'],
          preload: true
        });
        scope.soundVolume = 90;

        scope.tasktime = TIME_TASK;
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
        scope.tasktime = TIME_TASK;
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


    // Ensures a short break follows a work session and stops countdowns
    scope.checkRunning = function() {
      if (scope.isTimerRunning === true) {
        $interval.cancel(scope.timerInterval);
        scope.isTimerRunning = false;
        scope.onBreak = true;
        scope.tasktime = TIME_BREAK;
        scope.sessionTracker += 1;
        scope.breakButtonText = "Start break";
        scope.buttonText = "Start";
      }
      if (scope.isBreakRunning === true) {
        $interval.cancel(scope.timerInterval);
        scope.onBreak = false;
        scope.isBreakRunning = false;
        scope.tasktime = TIME_TASK;
        scope.buttonText = "Start";
      }
    };


    // Stops all timer countdowns at 0, tracks work sessions to set a 30-minute break after four
    scope.expireTimer = function(){
      if (scope.tasktime === 0){
        if (scope.sessionTracker <= 3) {
          scope.checkRunning(); 
        }  
        if (scope.sessionTracker === 4) {
          $interval.cancel(scope.timerInterval);
          scope.onBreak = true;
          scope.tasktime = TIME_LONG_BREAK;
          scope.sessionTracker = 0;
          scope.breakButtonText = "Start break";
          scope.buttonText = "Start";
        }
      }
    };


    // Uses the $watch method to control the timer display and sound
    scope.$watch('tasktime', function(newVal, oldVal) {
      if (newVal === 0) {
        mySound.setVolume(scope.soundVolume);
        sound = mySound;
        mySound.play();
        scope.expireTimer();
      }
    });
    

    // Changes button classes based on buttonText
    scope.setButtonClass = function() {
      if (scope.buttonText === "Start"){
        return 'animated infinite pulse';
      }
      if (scope.buttonText === "Reset"){
        return '';
      }
    };


    // Changes break button classes based on breakButtonText
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