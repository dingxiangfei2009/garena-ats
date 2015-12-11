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

    $scope.topics = [
      {
        name: 'Algorithm and Data Structures',
        value: 'adt'
      },
      {
        name: 'Android',
        value: 'and'
      },
      {
        name: 'iOS',
        value: 'ios'
      },
      {
        name: 'Networks',
        value: 'net'
      },
      {
        name: 'Operating Systems',
        value: 'ops'
      },
      {
        name: 'Security',
        value: 'sec'
      },
      {
        name: 'Web Development',
        value: 'web'
      }
    ];

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
      // $scope.typeState[index] = type.value;
      // $scope.questionType[index] = type.name;
      $scope.questions[index].type = type;
    }
    $scope.difficultyChange = function(difficulty, index) {
      $scope.questions[index].difficulty = difficulty;
    }
    $scope.topicChange = function(topic, index) {
      $scope.questions[index].topic = topic;
    }
    $scope.markChange = function(mark, index) {
      $scope.questions[index].mark = mark;
    }
    $scope.useRichText = function(index) {
      $('.richtext').hide();
      CKEDITOR.replace('editor' + index);
    }
    $scope.addQuestion = function() {
      // $scope.questionList.push($scope.questionList.length + 1);
      // $scope.typeState.push('DEF');
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
    }
    $scope.display = function(val) {
    }
    $scope.remove = function(index) {
      // $scope.questionList.splice(index, 1);
      // $scope.question.splice(index, 1);
      // $scope.answer.splice(index, 1);
      // $scope.difficulty.splice(index, 1);
      // $scope.typeState.splice(index, 1);
      // $scope.questionType.splice(index, 1);
      $scope.questions.splice(index, 1);
    }
    $scope.submit = function() {
      for(var x = 0; x < $scope.questions.length; x++){
        var question = $scope.questions[x];

        var editor = CKEDITOR.instances['editor' + x];
        if (editor) {
          question.questionText = CKEDITOR.instances['editor' + x].getData();
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
    }

}]);
