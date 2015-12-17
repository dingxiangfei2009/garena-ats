angular.module('app').controller('JobEditorController', ['$scope','$http',
function($scope, $http){
'use strict';

var question_types = {
  'mas': 'Multiple Answer',
  'sbt': 'Subjective Text',
  'sbc': 'Subjective Code',
  'fib': 'Fill in the Blanks'
};
var difficulties = {
  '1': 'Easy',
  '2': 'Medium',
  '3': 'Difficult'
};
var experiences = {
  '0': 'None',
  '2': '2 Years Experience',
  '5': '5 Years Experience',
  '10': '10 Years Experience'
};

var id = $('#id').val();

$http.get('/topics/all').success(data => {
  $scope.topics = data.map(topic => ({
    name: topic.name,
    value: topic.token
  }))
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

$http.get(`/job/${id}/`).success(data =>
  $scope.job = {
    id: data.info.id,
    pos: data.info.title,
    desc: data.info.description,
    exp: {
      name: experiences[data.info.experience],
      value: data.info.experience
    },
    testParameters: data.test_parameter.topics.map(parameter => ({
      topic: {
        name: data.fields[parameter.topic],
        value: parameter.topic
      },
      no: parameter.count,
      diff: {
        name: difficulties[parameter.difficulty],
        value: parameter.difficulty
      },
      type: {
        name: question_types[parameter.type],
        value: parameter.type
      }
    }))
  }
);

$scope.topicChange = function(topic, index) {
  $scope.job.testParameters[index].topic = topic;
};

$scope.typeChange = function(type, index) {
  $scope.job.testParameters[index].type = type;
};

$scope.diffChange = function(diff, index) {
  $scope.job.testParameters[index].diff = diff;
};

$scope.expChange = function(exp) {
  $scope.job.exp = exp;
};

$scope.addTopic = function() {
  $scope.job.testParameters.push({
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
  });
};

$scope.save = function() {
  $.ajax({
    url: `/job/${id}/edit`,
    method: 'POST',
    data: {
      title: $scope.job.pos,
      experience: $scope.job.exp.value,
      description: $scope.job.desc,
      test_parameter: JSON.stringify({
        topics:
          $scope.job.testParameters.filter(parameter =>
            parameter.topic.value && parameter.type.value &&
            parameter.diff.value && parameter.no
          ).map(parameter => ({
            topic: parameter.topic.value,
            type: parameter.type.value,
            difficulty: parameter.diff.value,
            count: parameter.no
          }))
      })
    }
  }).success(show_success);
};

function show_success() {
  $('#success').modal('show');
}

}]);
