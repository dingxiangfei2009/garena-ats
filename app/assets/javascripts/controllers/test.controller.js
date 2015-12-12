angular.module('app').controller('LoadTestController', ['$scope', '$rootScope',
function($scope, $rootScope){
  $scope.load = function(test_id) {
    $rootScope.$broadcast('load-test', test_id);
  };
}]);

angular.module('app').controller('TestController',
['$scope', '$http', '$interval', '$timeout', '$sce',
function($scope, $http, $interval, $timeout, $sce) {
  var qmod;
  require(['qmod'], _ => qmod = _);
  $scope.$on('load-test', function(event, test_id) {
    load_test(test_id);
  });
  $scope.types = ['mas', 'sbc', 'sbt', 'fib'];

  var ace_editors;

  $scope.trustAsHtml = $sce.trustAsHtml;

  $scope.createAceOption = function(question_index) {
    function aceLoaded(editor) {
      ace_editors[question_index] = editor;
      editor
        .getSession()
        .setMode(
          'ace/mode/' +
            ace_language_modes.get($scope.answer[question_index].language));
    }
    function aceChanged(e) {
    }
    return {
      useWrapMode : true,
      showGutter: false,
      theme:'twilight',
      onLoad: aceLoaded,
      onChange: aceChanged
    };
  };

  var ace_language_modes = new Map([
    ['javascript', 'javascript'],
    ['ruby', 'ruby'],
    ['cxx', 'c++']
  ]);

  $scope.switch_language = function(question_index, language) {
    ace_editors[question_index]
      .getSession()
      .setMode(
        'ace/mode/' +
        ace_language_modes.get($scope.answer[question_index].language));
  }

  $scope.testName = '';
  $scope.attempt = [];
  $scope.answer = [];
  $scope.aceEditor = {};
  $scope.questions = [];
  $scope.duration = 0;

  var RESPONSE_ID_TO_IDX, IDX_TO_RESPONSE_ID, questions;
  var url;
  function load_test(id) {
    url = 'test/' + Number(id);
    // scope set-up
    $scope.attempt = [];
    $scope.answer = [];
    ace_editors = [];
    $scope.questions = [];
    $scope.loaded = false;
    // shared maps
    RESPONSE_ID_TO_IDX = []; IDX_TO_RESPONSE_ID = []; questions = [];
    $http.get(url)
      .success(function(result) {
        var data = angular.fromJson(result);
        $scope.question_info = data.question_type_infos;
        $scope.testName = data.info.name;
        var countdown = new Date(data.info.start_time) - new Date + data.info.duration * 1000;
        debugger;
        if (countdown < 0) {
          $('#timeout').modal('show');
          return;
        }
        $scope.end_time =
          new Date(data.info.start_time).valueOf() + data.info.duration * 1000;
        $timeout(() => $('timer')[0].start(), 0);
        $scope.$on('timer-stopped', () =>
          $('#timeout').modal('show')
        );

        var prev_question_type = null;
        $scope.question_type_breaks = [];
        for (var x = 0, question; x < data.questions.length; x++) {
          if (data.questions[x].info.question_type !== prev_question_type) {
            $scope.question_type_breaks.push(x);
            prev_question_type = data.questions[x].info.question_type;
          }
          switch (data.questions[x].info.question_type) {
            case 'mas':
              question = new qmod.MCQQuestion(data.questions[x].info);
              $scope.questions.push(question.getQuestion());
              $scope.answer.push(
                question.parseAnswer(data.questions[x].config.answer));
              break;
            case 'sbt':
              question = new qmod.SBTQuestion(data.questions[x].info);
              $scope.questions.push(question.getQuestion());
              $scope.answer.push(
                question.parseAnswer(data.questions[x].config.answer));
              break;
            case 'sbc':
              question = new qmod.SBCQuestion(data.questions[x].info);
              $scope.questions.push(question.getQuestion());
              $scope.answer.push(
                question.parseAnswer(data.questions[x].config.answer));
              break;
            case 'fib':
              question = new qmod.FIBQuestion(data.questions[x].info);
              $scope.questions.push(question.getQuestion());
              $scope.answer.push(
                question.parseAnswer(data.questions[x].config.answer));
              break;
          }
          RESPONSE_ID_TO_IDX[data.questions[x].config.id] = x;
          IDX_TO_RESPONSE_ID[x] = data.questions[x].config.id;
          questions.push(data.questions[x].info);
        }
        start_autosave(data);
        $scope.loaded = true;
      });
  }
  function collateAnswer() {
    return questions.map(function(question, i) {
      return {
        id: IDX_TO_RESPONSE_ID[i],
        answer: qmod.stringifyAnswer(questions[i], $scope.answer[i]),
        updated_at: new Date,
        attempted: $scope.attempt[i]
      };
    });
  }

  $scope.attempted = function(index) {
    $scope.attempt[index] = true;
  };

  $('#attempt').progress({
    value: 1,
    total: $scope.questions.length,
    text: {
      ratio: '{value} of {total}'
    }
  });

  $scope.submit_answer = function() {
    var is_all_completed = true;
    for (var i = 0; i < questions.length; ++i)
      is_all_completed &= $scope.attempt[i];
    if (is_all_completed)
      send_answer();
    else
      $('#confirm-not-complete').modal('show');
  };

  $scope.send_answer = send_answer;

  function send_answer() {
    $.ajax({
      url: url,
      method: 'POST',
      data: {
        answer: JSON.stringify(collateAnswer())
      }
    }).success(function(msg) {
      $('#submit-success').modal('show');
    });
  }

  function start_autosave(data) {
    function prepare_autosave_data(answer) {
      return {
        id: answer.id,
        answer: answer.answer,
        updated_at: new Date(answer.updated_at),
        attempted: $scope.attempt[RESPONSE_ID_TO_IDX[answer.id]]
      };
    }
    var DB_NAME = 'DATA_TEST_AUTOSAVE';
    var VERSION = 1;
    // update indexed db data
    var request = indexedDB.open(DB_NAME, VERSION);
    function get_autosave_transaction(db) {
      var transaction = db.transaction('autosave', 'readwrite');
      transaction.onerror = e => console.log(e);
      return transaction.objectStore('autosave');
    }
    request.onupgradeneeded = function(e) {
      var db = e.target.result;
      var autosave = db.createObjectStore('autosave', {keyPath: 'id'});
      autosave.transaction.oncomplete = function () {
        var autosave = get_autosave_transaction(db);
        data.questions.forEach(
          question =>
            autosave.add(prepare_autosave_data(question.config)));
      };
    };
    var timeout_handler = null;
    request.onsuccess = function(e) {
      var db = e.target.result;
      // compare
      data.questions.forEach(function(question) {
        var autosave = get_autosave_transaction(db);
        var server_updated_at = new Date(question.config.updated_at);
        var read_request = autosave.get(question.config.id);
        read_request.onerror =
          () => get_autosave_transaction(db).add(prepare_autosave_data(question.config));
        read_request.onsuccess = function() {
          var autosave_data = read_request.result;
          if (!autosave_data)
            get_autosave_transaction(db).add(prepare_autosave_data(question.config))
          else if (autosave_data.updated_at < server_updated_at)
            get_autosave_transaction(db).put(prepare_autosave_data(question.config));
          else
            $scope.$apply(function() {
              var idx = RESPONSE_ID_TO_IDX[question.config.id];
              $scope.answer[idx] = qmod.parseAnswer(question.info, autosave_data.answer);
              $scope.attempt[idx] = autosave_data.attempted;
            });
        };
      });
      // start autosave service
      timeout_handler = $interval(function() {
        collateAnswer().forEach(
          answer => get_autosave_transaction(db).put(prepare_autosave_data(answer))
        );
      }, 3000);
    };
    return {
      stop_autosave() {
        $interval.cancel(timeout_handler);
      }
    };
  }
}]);
