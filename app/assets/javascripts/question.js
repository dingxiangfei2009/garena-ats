angular.module('app').controller('QuestionEditController',
['$scope', '$http', function($scope, $http) {

    $scope.question_id = $('#id').val();
    $scope.state = false;
    $scope.typeState = [0];
    $scope.questionType = [];
    $scope.questionList = [1];
    $scope.difficulty = [];
    $scope.question = [];
    $scope.answer = [];

    var config = JSON.parse($('#question-config').val());
    $scope.question = {
      topic: {
        name: 'Select Topic',
        value: '0'
      },
      type: {
        name: 'Select Question Type',
        value: '0'
      },
      questionText: '',
      difficulty: {
        name: 'Select Difficulty Level',
        value: '0'
      },
      answer: {}
    };

    $http.get('/topics/all')
    .success(function(data) {
      $scope.topics = data.map(topic => ({
        name: topic.name,
        value: topic.token
      }));
      // process config
      $scope.question = {
        topic: $scope.topics.filter(topic => topic.value === config.topic)[0],
        type: $scope.types.filter(type => type.value === config.type)[0],
        difficulty: $scope.difficulties.filter(difficulty => difficulty.value == config.difficulty)[0],
        mark: config.mark,
        questionText: config.description,
        answer: JSON.parse(config.configuration).answer
      };
      // $('.ui.checkbox').checkbox();
    });

    $scope.types = [
      {
        name: 'Multiple Answer',
        value: 'mas'
      },
      {
        name: 'Subjective Text',
        value: 'sbt'
      },
      {
        name: 'Subjective Code',
        value: 'sbc'
      },
      {
        name: 'Fill in the Blanks',
        value: 'fib'
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
    $scope.typeChange = function(type) {
      $scope.question.type = type;
      switch (type.value) {
      case 'mas':
        $scope.question.answer = [
          {description: '', correct: false},
          {description: '', correct: false},
          {description: '', correct: false},
          {description: '', correct: false}
        ];
        break;
      case 'sbt':
        $scope.question.answer = {description: ''};
        break;
      case 'sbc':
        $scope.question.answer = {description: ''};
        break;
      case 'fib':
        $scope.question.answer = {};
      }
    };
    $scope.difficultyChange = function(difficulty) {
      $scope.question.difficulty = difficulty;
    };
    $scope.topicChange = function(topic) {
      $scope.question.topic = topic;
    };
    $scope.markChange = function(mark, index) {
      $scope.question.mark = mark;
    };
    $scope.useRichText = function() {
      $('.richtext').hide();
      CKEDITOR.replace('editor');
    };
    $scope.submit = function() {
      var configuration = angular.toJson({
        answer: $scope.question.answer
      });
      var editor = CKEDITOR.instances['editor'];
      if (editor)
        question.questionText = editor.getData();
      var question = $scope.question;
      if (question.type.value === 'fib')
        question.questionText = question.answer.statement;
      var dataToSend = {
        type: question.type.value,
        topic: question.topic.value,
        mark: question.mark,
        difficulty: question.difficulty.value,
        description: question.questionText,
        configuration: configuration
      };

      $.ajax({
        method: "POST",
        url: `/question/${$scope.question_id}`,
        data: dataToSend
      })
      .success(function(data) {
        $('.ui.modal').modal('show');
      });
    };

}]);
