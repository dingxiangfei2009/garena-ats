// (function() {
/* global angular */
var BIND_HANDLERS = new Map;

function delegate_property_setter(constructor, property, event_name) {
  if (!BIND_HANDLERS.has(constructor))
    BIND_HANDLERS.set(constructor, {});
  var o = Object.getOwnPropertyDescriptor(constructor.prototype, property);
  var getter = o.get;
  var setter = o.set;
  Object.defineProperty(constructor.prototype, property, {
    configurable: true,
    enumerable: true,
    get: o.get,
    set (x) {
      var self = this;
      var before = getter.call(this);
      setter.call(this, x);
      var after = getter.call(this);
      if (before !== after)
        if ('function' === typeof event_name)
          requestAnimationFrame(function() {
            event_name(self);
          });
        else if (Array.isArray(event_name))
          requestAnimationFrame(function() {
            event_name.forEach(function (ev) {
              self.dispatchEvent(new Event(ev));
            });
          });
        else
          requestAnimationFrame(() => self.dispatchEvent(new Event(event_name)));
      return x;
    }
  });
  BIND_HANDLERS.get(constructor)[property] = setter;
}

delegate_property_setter(HTMLInputElement, 'value', ['input', 'change']);
delegate_property_setter(HTMLInputElement, 'checked', ['input', 'change', 'click']);
delegate_property_setter(HTMLOptionElement, 'selected', function (element) {
  element.parentElement.dispatchEvent(new Event('change'));
});
delegate_property_setter(HTMLTextAreaElement, 'value', ['input', 'change']);

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
      // alert(angular.toJson($scope.questions));
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

        // alert(angular.toJson(dataToSend));

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

  $scope.job = {
    exp: '',
    pos: '',
    desc: '',
    skills: '',
    testParameters: [{
      topic: {
        name: 'Select Topic',
        value: 'def'
      },
      no: 1,
      diff: {
        name: 'Select Difficulty',
        value: '0'
      }
    }]
  };
  $scope.jobTopics = [
    {

    }
  ];

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

  $scope.experiences = [
    {
      name: 'None',
      value: '0'
    },
    {
      name: '2 Years Experience',
      value: '2'
    },
    {
      name: '5 Years Experience',
      value: '5'
    },
    {
      name: '10 Years Experience',
      value: '10'
    }
  ];

  $scope.expChange = function(exp, index) {
    $scope.job.exp = exp.value;
  };

  $scope.diffChange = function(diff, index) {
    $scope.job.testParameters[index].diff = diff;
  };

  $scope.topicChange = function(topic, index) {
    $scope.job.testParameters[index].topic = topic;
  };

  $scope.submit = function(){
    $scope.job.skills = $('.ui.dropdown.multiple').dropdown('get value');
    var testParams = [];
    for (var x = 0; x < $scope.job.testParameters.length; x++) {
      testParams.push({
        topic: $scope.job.testParameters[x].topic.value,
        difficulty: $scope.job.testParameters[x].diff.value,
        count: $scope.job.testParameters[x].no
      });
    }
    var dataToSend = {
      title: $scope.job.pos,
        description: $scope.job.desc,
        experience: $scope.job.exp,
        test_parameter: angular.toJson(testParams)
    };
    // alert(angular.toJson(dataToSend));
    $.ajax({
      method: "POST",
      url: "/job",
      data: dataToSend
    })
    .success(function(data) {
      console.log(data);
      $('.ui.modal').modal('show');
    });
  };

}]);

app.controller('TestsController', function($scope) {
  $scope.searchText = '';

  $scope.newCandidate = {
    position: '',
    name: '',
    email: ''
  };

  $scope.tests = [
    {
      position: 'Android Developer',
      candidate: 'Ding Xiangfei',
      complete: 'Evaluate',
      score: '-'
    },
    {
      position: 'Web Developer',
      candidate: 'Qunfeng Ye',
      complete: 'Not Completed',
      score: '-'
    },
    {
      position: 'Security Engineer',
      candidate: 'Anand Sundaram',
      complete: 'View Report',
      score: '17/20'
    },
    {
      position: 'Data Scientist',
      candidate: 'Zhao Cong',
      complete: 'View Report',
      score: '9/10'
    }
  ];

  $scope.positions = [
    {
      name: 'Android Developer',
      value: 'AND'
    },
    {
      name: 'Data Scientist',
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

  $scope.setNewPosition = function (pos) {
    $scope.newCandidate.pos = pos.name;
  };

  $scope.submit = function () {
    $scope.tests.push({
      position: $scope.newCandidate.pos,
      candidate: $scope.newCandidate.name,
      complete: 'Not Completed',
      score: '-'
    });
  };

  setTimeout(function(){
    $('.ui.modal')
      .modal('attach events', '.green.button', 'show')
    ;
  }, 0);

  $('.ui.selection.dropdown')
    .dropdown()
  ;



});

app.controller('TestController', ['$scope', '$http', function($scope, $http) {
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

}]);

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
