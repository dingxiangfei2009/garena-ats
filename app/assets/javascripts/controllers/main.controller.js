// (function() {
/* global angular */
var app = angular.module('app', ['textAngular', 'templates', 'ui.ace', 'timer']);

app.controller('SidebarController', function($scope) {

    $scope.state = false;
    $scope.activeId = '';

    $scope.toggleState = function() {
        $scope.state = !$scope.state;
    };
    $scope.clickAlert = function(idName) {
      alert("You clicked me " + idName);
      $('#' + idName).addClass('active');
      $('#' + $scope.activeId).removeClass('active');
      $scope.activeId = idName;
    }

});

app.controller('QuestionController', function($scope) {

    $scope.state = false;
    $scope.typeState = 'DEF';

    $scope.topics = [
      {
        name: 'Algorithm and Data Structures',
        value: 'ADS'
      },
      {
        name: 'Android',
        value: 'AND'
      },
      {
        name: 'iOS',
        value: 'IOS'
      },
      {
        name: 'Networks',
        value: 'NET'
      },
      {
        name: 'Operating Systems',
        value: 'OPS'
      },
      {
        name: 'Security',
        value: 'SEC'
      },
      {
        name: 'Web Development',
        value: 'WEB'
      }
    ];

    $scope.types = [
      {
        name: 'Multiple Choice',
        value: 'MCQ'
      },
      {
        name: 'Multiple Answer',
        value: 'MAS'
      },
      {
        name: 'Fill in the Blanks',
        value: 'FIB'
      },
      {
        name: 'Subjective Text',
        value: 'SBT'
      },
      {
        name: 'Subjective Code',
        value: 'SBC'
      }
    ];

    $scope.difficulties = [
      {
        name: 'Easy',
        value: '1'
      },
      {
        name: 'Medium',
        value: '2'
      },
      {
        name: 'Difficult',
        value: '3'
      }
    ];

    $scope.toggleState = function() {
        $scope.state = !$scope.state;
    };
    $scope.clickAlert = function() {
      alert("You clicked me!");
    }
    $scope.typeChange = function(typeValue) {
      $scope.typeState = typeValue;
    }

});

app.controller('TestsController', function($scope) {
  $scope.tests = [
    {
      position: 'Android Developer',
      candidate: 'Ding Xiangfei',
      complete: 'Evaluate'
    },
    {
      position: 'Web Developer',
      candidate: 'Invite',
      complete: 'Not Completed'
    },
    {
      position: 'Security Engineer',
      candidate: 'Anand Sundaram',
      complete: 'View Score'
    },
  ];
});

app.controller('TestController', function($scope) {
  $scope.testName = 'Garena Android Developer Test';
  
  $scope.questions = [
    {
      type: 'MCQ',
      statement: 'Which of the following are true?',
      optionA: 'The Void class extends the Class class.',
      optionB: 'The Float class extends the Double class.',
      optionC: 'The System class extends the Runtime class',
      optionD: 'The Integer class extends the Number class.'
    },
    {
      type: 'MAT',
      statement: 'Which of the following is true?',
      optionA: 'The Class class is the superclass of the Object class.',
      optionB: 'The Object class is final.',
      optionC: 'The Class objects are constructed by the JVM as classes are loaded by an instance of java.lang.ClassLoader',
      optionD: 'None of the above.'
    },
    {
      type: 'SBT',
      statement: 'Describe briefly how over-riding is different from over-loading',
    },
    {
      type: 'SBC',
      statement: 'Write a function to perform bubble-sort. The function takes in an array of 10 numbers as parameter.',
    }
  ];

  $scope.check = function() {
    alert("you checked me out");
    $('.ui.checkbox')
      .checkbox()
    ;
  };

});

app.directive('multipleChoice', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      templateUrl: '/templates/multiple-choice.html'
  };
});

app.directive('multipleAnswer', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      templateUrl: '/templates/multiple-answer.html'
  };
});

app.directive('subjectiveText', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      templateUrl: '/templates/subjective-text.html'
  };
});

app.directive('subjectiveCode', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      templateUrl: '/templates/subjective-code.html'
  };
});
// }());
