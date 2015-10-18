// (function() {
/* global angular */
var app = angular.module('app', ['textAngular', 'templates', 'ui.ace']);

app.controller('SidebarController', function($scope) {

    $scope.state = false;

    $scope.toggleState = function() {
        $scope.state = !$scope.state;
    };
    $scope.clickAlert = function() {
      alert("You clicked me!");
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
