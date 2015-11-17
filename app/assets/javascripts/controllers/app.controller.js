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
    templateUrl: '/templates/fill-in-blank.html',
    link: function(scope, element) {
      scope.data.blanks = scope.blanks = [];
      var blanks = [];
      scope.front_back = [];
      var text_area = angular.element('textarea', element)[0];
      var rich_text_btn = angular.element('.btn-richtext', element)[0];
      var editor;
      scope.useRichText = function() {
        angular.element(rich_text_btn).hide();
        editor = CKEDITOR.replace(text_area);
        editor.on('change', function() {
          editor.updateElement();
        });
      };
      var look_around = 20;
      scope.watch_content = function() {
        scope.data.blanks = scope.blanks;
        var statement = scope.data.statement = scope.statement;
        var r = /\{\{\s*blank\s*\}\}/g;
        var positions = [];
        var lengths = [];
        var match;
        while (match = r.exec(statement)) {
          positions.push(match.index);
          lengths.push(match[0].length);
        }
        scope.front_back.length = scope.blanks.length = positions.length;
        if (positions.length)
          for (var i = 0, end = positions.length; i < end; ++i)
            scope.front_back[i] = [
              statement.slice(
                Math.max(0, positions[i] - look_around, positions[i - 1] + lengths[i - 1] || 0),
                positions[i]),
              statement.slice(
                positions[i] + lengths[i],
                Math.min(positions[i] + lengths[i] + look_around, positions[i + 1] || Infinity))
            ];
        for (var i = 0, end = positions.length; i < end; ++i)
          scope.blanks[i] = blanks[i];
      };
      scope.update_blank = function (index) {
        scope.data.blanks = scope.blanks;
        blanks[index] = scope.blanks[index];
      };
      element.on('$destory', function() {
        editor && editor.destory();
      });
    }
  }
})
}();
