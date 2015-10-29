// (function() {
/* global angular */
var app = angular.module('app', ['templates', 'ui.ace', 'timer']);

app.controller('SidebarController', function($scope) {

    $scope.state = false;
    $scope.activeId = '';

    $scope.toggleState = function() {
        $scope.state = !$scope.state;
    };
    $scope.clickAlert = function(idName) {
      // alert("You clicked me " + idName);
      $('#' + idName).addClass('active');
      $('#' + $scope.activeId).removeClass('active');
      $scope.activeId = idName;
    }

});

app.controller('QuestionController', ['$scope', '$http', function($scope, $http) {

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
    $scope.clickAlert = function() {
      // alert("You clicked me!");
    }
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
      // alert("Current length is " + $scope.questionList.length + " new length is " + ($scope.questionList.length + 1));
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
      alert(val);
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
      alert(angular.toJson($scope.questions));
      for(var x = 0; x < $scope.questions.length; x++){
        var question = $scope.questions[x];

        var editor = CKEDITOR.instances['editor' + x];
        if (editor) {
          question.questionText = CKEDITOR.instances['editor' + x].getData();
        }

        var configuration = angular.toJson({
          description: question.questionText,
          answer: question.answer
        });

        var dataToSend = {
          type: question.type.value,
          topic: question.topic.value,
          mark: question.mark,
          difficulty: question.difficulty.value,
          configuration: configuration
        };

        alert(angular.toJson(dataToSend));

        // $http({
        //   method: 'POST',
        //   url: '/question',
        //   data: dataToSend
        // }).then(function successCallback(response) {
        //     // this callback will be called asynchronously
        //     // when the response is available
        //     // $('.ui.positive.message').removeClass('hidden').addClass('visible');
        //     $('.ui.modal')
        //       .modal('show')
        //     ;
        //   }, function errorCallback(response) {
        //     // called asynchronously if an error occurs
        //     // or server returns response with an error status.
        //     // $('.ui.positive.message').removeClass('hidden').addClass('visible');
        //     $('.ui.modal')
        //       .modal('show')
        //     ;
        //   });

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

app.controller('JobController', ['$scope', '$http', function($scope, $http) {

  $scope.jobTopics = [1];

  $scope.topics = [
    {
      name: 'Algorithm and Data Structures',
      value: '1'
    },
    {
      name: 'Android',
      value: '2'
    },
    {
      name: 'iOS',
      value: '3'
    },
    {
      name: 'Networks',
      value: '4'
    },
    {
      name: 'Operating Systems',
      value: '5'
    },
    {
      name: 'Security',
      value: '6'
    },
    {
      name: 'Web Development',
      value: '7'
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

}]);

app.controller('TestsController', function($scope) {
  $scope.tests = [
    {
      position: 'Android Developer',
      candidate: 'Ding Xiangfei',
      complete: 'Evaluate'
    },
    {
      position: 'Web Developer',
      candidate: 'Qunfeng Ye',
      complete: 'Not Completed'
    },
    {
      position: 'Security Engineer',
      candidate: 'Anand Sundaram',
      complete: 'View Score'
    },
  ];

  $scope.positions = [
    {
      name: 'Android Developer',
      value: 'AND'
    },
    {
      name: 'Database Scientist',
      value: 'DAT'
    },
    {
      name: 'Security Engineer',
      value: 'SEC'
    },
    {
      name: 'System Admin',
      value: 'SYS'
    },
    {
      name: 'Web Developer',
      value: 'WEB'
    }
  ];

  $('.ui.selection.dropdown')
    .dropdown()
  ;
  $('.ui.modal')
    .modal('attach events', '.green.button', 'show')
  ;


});

app.controller('TestController', function($scope) {
  $scope.testName = 'Garena Android Developer Test';

  $scope.questions = [
    {
      type: 'MCQ',
      statement: 'Which of the following are true?',
      optionA: 'The Void class extends the Class class.',
      optionB: 'The Float class extends the Double class.',
      optionC: 'The System class extends the Runtime class',
      optionD: 'The Integer class extends the Number class.'
    },
    {
      type: 'MAT',
      statement: 'Which of the following is true?',
      optionA: 'The Class class is the superclass of the Object class.',
      optionB: 'The Object class is final.',
      optionC: 'The Class objects are constructed by the JVM as classes are loaded by an instance of java.lang.ClassLoader',
      optionD: 'None of the above.'
    },
    {
      type: 'SBT',
      statement: 'Describe briefly how over-riding is different from over-loading',
    },
    {
      type: 'SBC',
      statement: 'Write a function to perform bubble-sort. The function takes in an array of 10 numbers as parameter.',
    }
  ];

  $scope.aceLoaded = function(_editor) {
    // Options

  };

  $scope.aceChanged = function(e) {
    //
    console.log('Ace editor changed');
    // Get Current Value
    var currentValue = _editor.getSession().getValue();
    console.log(currentValue);
  };

  $scope.check = function() {
    // alert("you checked me out");
  };

  $('#attempt').progress({
    value: 1,
    total: $scope.questions.length,
    text: {
      ratio: '{value} of {total}'
    }
  });

});

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
// }());
