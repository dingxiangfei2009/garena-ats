!function() {
/* global angular */
var app = angular.module('app', ['templates', 'ui.ace', 'timer']);

app.directive('multipleChoice', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '='
      },
      templateUrl: '/templates/multiple-choice.html'
  };
});

app.directive('multipleAnswer', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      scope: {
        'data': '=',
        'display': '='
      },
      templateUrl: '/templates/multiple-answer.html'
  };
});

app.directive('subjectiveText', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '='
      },
      templateUrl: '/templates/subjective-text.html'
  };
});

app.directive('subjectiveCode', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '='
      },
      templateUrl: '/templates/subjective-code.html'
  };
});

app.directive('fillInBlank', function() {
  return {
    restrict: 'AE',
    replace: 'true',
    scope: {
      data: '='
    },
    templateUrl: '/templates/fill-in-blank.html'
  }
})
}();