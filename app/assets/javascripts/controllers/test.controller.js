angular.module('app').controller('LoadQuestionController', ['$scope', '$rootScope'
function($scope, $rootScope){
  $scope.load = function(test_id) {
    $rootScope.$broadcast('load-test', test_id);
  };
}]);

angular.module('app').controller('TestController',
['$scope', '$http', '$interval', function($scope, $http, $interval) {
  $scope.$on('load-test', function(event, test_id) {
    load_test(test_id);
  });
  
  var question_controllers = {
    'mas': {},
    'sbt': {},
    'sbc': {}
  };
  //   {
  //     type: 'mas',
  //     statement: 'Which of the following are true?',
  //     optionA: 'The Void class extends the Class class.',
  //     optionB: 'The Float class extends the Double class.',
  //     optionC: 'The System class extends the Runtime class',
  //     optionD: 'The Integer class extends the Number class.'
  //   },
  //   {
  //     type: 'mas',
  //     statement: 'Which of the following is true?',
  //     optionA: 'The Class class is the superclass of the Object class.',
  //     optionB: 'The Object class is final.',
  //     optionC: 'The Class objects are constructed by the JVM as classes are loaded by an instance of java.lang.ClassLoader',
  //     optionD: 'None of the above.'
  //   },
  //   {
  //     type: 'sbt',
  //     statement: 'Describe briefly how over-riding is different from over-loading',
  //   },
  //   {
  //     type: 'sbc',
  //     statement: 'Write a function to perform bubble-sort. The function takes in an array of 10 numbers as parameter.',
  //   }
  // ];

  $scope.types = ['mas', 'sbt', 'sbc'];
  
  function MCQQuestion(question) {
    this.question = question;
  }
  Object.assign(MCQQuestion.prototype, {
    getQuestion() {
      return {
        type: this.question.question_type,
        statement: this.question.description,
        answers: angular.fromJson(this.question.config).answer
      };
    },
    parseAnswer(answer) {
      if (answer) {
        var ret = Array(this.getQuestion().answers.length).fill(false);
        var indices = angular.fromJson(answer);
        indices.forEach(idx => ret[idx] = true);
        return ret;
      } else
        return [];
    },
    stringifyAnswer(answer) {
      if (answer) {
        var ret = [];
        answer.forEach((tick, idx) => tick && ret.push(idx));
        return angular.toJson(ret);
      } else
        return '[]';
    }
  });
  function parseAnswer(question, answer) {
    var qn_controller;
    switch (question.question_type) {
      case 'mas':
        qn_controller = new MCQQuestion(question);
        return qn_controller.parseAnswer(answer);
    }
  }
  function stringifyAnswer(question, answer) {
    var qn_controller;
    switch (question.question_type) {
      case 'mas':
        qn_controller = new MCQQuestion(question);
        return qn_controller.stringifyAnswer(answer);
    }
  }

  $scope.aceLoaded = function(_editor) {
    // PROBLEM: aceEditor may be shared by multiple questions, Anand.
    $scope.aceEditor = _editor;
  };

  $scope.aceChanged = function(e) {
    // PROBLEM: refer to $scope.aceLoaded
    console.log('Ace editor changed');
    // Get Current Value
    var currentValue = $scope.aceEditor.getSession().getValue();
    console.log(currentValue);
  };
  $scope.alert = () => window.alert();

  
  $scope.testName = 'Garena Android Developer Test';

  var RESPONSE_ID_TO_IDX, IDX_TO_RESPONSE_ID, questions;
  function load_test(id) {
    var url = 'test/' + Number(id);
    $scope.attempt = [];
    $scope.answer = [];

    $scope.aceEditor = {};

    $scope.questions = [];
    RESPONSE_ID_TO_IDX = []; IDX_TO_RESPONSE_ID = []; questions = [];
  }
  $http.get("test/1") // TODO
    .success(function(result) {
      var data = angular.fromJson(result);
      for (var x = 0, question; x < data.questions.length; x++) {
        switch (data.questions[x].info.question_type) {
          case 'mas':
            question = new MCQQuestion(data.questions[x].info);
            $scope.questions.push(question.getQuestion());
            $scope.answer.push(
              parseAnswer(
                data.questions[x].info,
                data.questions[x].config.answer));
            break;
          case 'sbt':
            $scope.questions.push(null);
            $scope.answer.push(null);
            break;
          case 'sbc':
            $scope.questions.push(null);
            $scope.answer.push(null);
            break;
        }
        RESPONSE_ID_TO_IDX[data.questions[x].config.id] = x;
        IDX_TO_RESPONSE_ID[x] = data.questions[x].config.id;
        questions.push(data.questions[x].info);
      }
      start_autosave(data);
    });
  function collateAnswer() {
    return questions.map(function(question, i) {
      return {
        id: IDX_TO_RESPONSE_ID[i],
        answer: stringifyAnswer(questions[i], $scope.answer[i]),
        updated_at: new Date
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
    $http.post('test/1', {
      data: JSON.stringify(collateAnswer())
    }).success(function(msg) {
      // success
    });
  };

  function start_autosave(data) {
    function prepare_autosave_data(answer) {
      return {
        id: answer.id,
        answer: answer.answer,
        updated_at: new Date(answer.updated_at)
      };
    }
    var DB_NAME = 'DATA_TEST_AUTOSAVE';
    var VERSION = 1;
    // update indexed db data
    var request = indexedDB.open(DB_NAME, VERSION);
    function get_autosave_transaction(db) {
      var transaction = db.transaction('autosave', 'readwrite');
      transaction.onerror = e => console.log(e);
      transaction.oncomplete = e => console.log(e);
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
          if (autosave_data.updated_at < server_updated_at)
            get_autosave_transaction(db).put(prepare_autosave_data(question.config));
          else
            $scope.$apply(function() {
              var idx = RESPONSE_ID_TO_IDX[question.config.id];
              $scope.answer[idx] = parseAnswer(question.info, autosave_data.answer);
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
