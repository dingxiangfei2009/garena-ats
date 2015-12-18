angular.module('app').controller('QuestionController', ['$scope', '$http', function($scope, $http) {

    $scope.state = false;
    $scope.typeState = [0];
    $scope.questionType = [];
    $scope.questionList = [1];
    $scope.difficulty = [];
    $scope.question = [];
    $scope.answer = [];

    $scope.questionObject = {
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
    $scope.questions = [$scope.questionObject];

    $http.get('/topics/all').success(data =>
        $scope.topics = data.map(topic => ({
            name: topic.name,
            value: topic.token
        }))
    );

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
    $scope.typeChange = function(type, index) {
      $scope.questions[index].type = type;
    };
    $scope.difficultyChange = function(difficulty, index) {
      $scope.questions[index].difficulty = difficulty;
    };
    $scope.topicChange = function(topic, index) {
      $scope.questions[index].topic = topic;
    };
    $scope.markChange = function(mark, index) {
      $scope.questions[index].mark = mark;
    };
    $scope.useRichText = function(index) {
      $('.richtext').hide();
      CKEDITOR.replace('editor' + index);
    };
    $scope.addQuestion = function() {
      $scope.questions.push({
        topic: {
          name: 'Select Topic',
          value: '0'
        },
        type: {
          name: 'Select Question Type',
          value: '0'
        },
        mark: 0,
        questionText: '',
        difficulty: {
          name: 'Select Difficulty Level',
          value: '0'
        },
        answer: {}
      });
    };
    $scope.remove = function(index) {
      $scope.questions.splice(index, 1);
    };
    $scope.submit = function() {
      for(var x = 0; x < $scope.questions.length; x++){
        var question = $scope.questions[x];

        var editor = CKEDITOR.instances['editor' + x];
        if (editor) {
          question.questionText = CKEDITOR.instances['editor' + x].getData();
        }
        if (question.type.value === 'fib') {
          question.questionText = question.answer.statement;
        }

        var configuration = angular.toJson({
          answer: question.answer
        });

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
            url: "/question",
            data: dataToSend
          })
          .success(function(data) {
            console.log(data);
            $('.ui.modal').modal('show');
          });
      }
    };

}]);
