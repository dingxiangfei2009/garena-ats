angular.module('app').controller('TestController',
['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
  var question_controllers = {
    'mas': {},
    'sbt': {},
    'sbc': {}
  };
  
  $scope.testName = 'Garena Android Developer Test';

  $scope.attempt = [];
  $scope.answer = [];

  $scope.aceEditor = {};

  $scope.questions = [];
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

  $scope.aceLoaded = function(_editor) {
    // Options
    $scope.aceEditor = _editor;
  };

  $scope.aceChanged = function(e) {
    //
    console.log('Ace editor changed');
    // Get Current Value
    var currentValue = $scope.aceEditor.getSession().getValue();
    console.log(currentValue);
  };

  $http.get("test/1") // TODO
    .success(function(result) {
      var data = angular.fromJson(result);
      for (var x = 0; x < data.questions.length; x++) {
        $scope.questions.push({
          type: data.questions[x].info.question_type,
          statement: data.questions[x].info.description,
          answers: angular.fromJson(data.questions[x].info.config).answer
        });
      }
      start_autosave(data);
    });

  $scope.attempted = function(index){
    $scope.attempt[index] = true;
  };

  $('#attempt').progress({
    value: 1,
    total: $scope.questions.length,
    text: {
      ratio: '{value} of {total}'
    }
  });

  $scope.submit_answer = function() {};

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
    request.onupgradeneeded = function(e) {
      var db = db.target.result;
      var autosave = db.createObjectStore('autosave', {keyPath: 'id'});
      autosave.transaction.oncomplete = function () {
        var transaction = db.transaction('autosave', 'readwrite');
        transaction.onerror = e => console.log(e);
        transaction.oncomplete = e => console.log(e);
        var autosave = transaction.objectStorage('autosave');
        data.questions.forEach(function(question) {
          autosave.add(prepare_autosave_data(question.config));
        });
      };
    };
    request.onsuccess = function(e) {
      var db = db.target.result;
      var transaction = db.transaction('autosave', 'readwrite');
      transaction.onerror = e => console.log(e);
      transaction.oncomplete = e => console.log(e);
      var autosave = transaction.objectStorage('autosave');
      // compare
      data.questions.forEach(function(question) {
        var server_updated_at = new Date(question.config.updated_at);
        var read_request = autosave.get(question.config.id);
        read_request.onerror =
          () => autosave.add(prepare_autosave_data(question.config));
        read_request.onsuccess = function() {
          var autosave_data = read_request.result;
          if (autosave_data.updated_at < server_updated_at)
            autosave.put(prepare_autosave_data(question.config));
          else
            Object.assign(question.config, autosave_data);
        };
      });
      // start autosave service
      var timeout_handler = $timeout(function() {
      });
    };
  }
}]);
