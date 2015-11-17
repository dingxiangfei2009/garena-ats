angular.module('app').controller('PositionController', ['$scope', '$http', function($scope, $http) {

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
      type: {
        name: 'Select Type',
        value: 'def'
      },
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

  $scope.typeChange = function(type, index) {
    $scope.job.testParameters[index].type = type;
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
        type: $scope.job.testParameters[x].type.value,
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
