!function() {
/* global angular */
var app = angular.module('app', ['ui.ace', 'timer']);

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
  var ace_language_modes = new Map([
    ['javascript', 'javascript'],
    ['ruby', 'ruby'],
    ['cxx', 'c++'],
    ['python', 'python']
  ]);
  return {
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '='
      },
      templateUrl: '/templates/subjective-code.html',
      link: function(scope, element) {
        if (!scope.data.suggested_answer)
          scope.data.suggested_answer = {
            language: 'cxx',
            code: ''
          };
        else {
          if (!scope.data.suggested_answer.language)
            scope.data.suggested_answer.language = 'cxx';
          if (!scope.data.suggested_answer.code && scope.data.value)
            scope.data.suggested_answer.code = scope.data.value;
        }
        // HACK: What the *** is wrong with people in ui-ace? If they have a fix
        // for editor-in-directive issue, why they are not applying the patch?
        var editor = ace.edit(
          angular.element('div[ui-ace]', element)[0]
        );
        function change_language() {
          editor.getSession().setMode(
            `ace/mode/${ace_language_modes.get(scope.data.language)}`);
        }
        scope.change_language = change_language;
        change_language();
      }
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
      function watch_content() {
        var statement = scope.data.statement || '';
        var r = /\{\{\s*blank\s*\}\}/g;
        var positions = [];
        var lengths = [];
        var match;
        while (match = r.exec(statement)) {
          positions.push(match.index);
          lengths.push(match[0].length);
        }
        if (!scope.data.blanks)
          scope.data.blanks = [];
        scope.front_back.length = scope.data.blanks.length = positions.length;
        for (var i = 0, end = positions.length; i < end; ++i)
          scope.front_back[i] = [
            statement.slice(
              Math.max(
                0,
                positions[i] - look_around,
                positions[i - 1] + lengths[i - 1] || 0),
              positions[i]),
            statement.slice(
              positions[i] + lengths[i],
              Math.min(
                positions[i] + lengths[i] + look_around,
                positions[i + 1] || Infinity))
          ];
      }

      var look_around = 20;
      scope.front_back = [];
      watch_content();

      var text_area = angular.element('textarea', element)[0];
      var rich_text_btn = angular.element('.btn-richtext', element)[0];
      var editor;
      scope.useRichText = function() {
        angular.element(rich_text_btn).hide();
        editor = CKEDITOR.replace(text_area);
        editor.on('change', () => editor.updateElement());
      };
      scope.watch_content = watch_content;
      scope.update_blank = function (index) {
        blanks[index] = scope.blanks[index];
      };
      element.on('$destory', function() {
        editor && editor.destory();
      });
    }
  }
})
}();
