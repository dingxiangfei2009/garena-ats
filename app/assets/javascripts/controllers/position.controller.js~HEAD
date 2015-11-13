angular.module('app').controller('PositionController', ['$scope', '$http', function($scope, $http) {

  $scope.job = {
    exp: '',
    pos: '',
    desc: '',
    skills: '',
    testParameters: [{
      topic: {
        name: 'Select Topic',
        value: null
      },
      no: 1,
      type: {
        name: 'Select Type',
        value: null
      },
      diff: {
        name: 'Select Difficulty',
        value: null
      }
    }]
  };
  $scope.jobTopics = [{}];

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
    var testParams =
      $scope.job.testParameters.filter(parameter =>
        parameter.topic.value && parameter.type.value && parameter.diff.value &&
        parameter.no
      ).map(parameter => ({
        topic: parameter.topic.value,
        type: parameter.type.value,
        difficulty: parameter.diff.value,
        count: parameter.no
      }));
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
