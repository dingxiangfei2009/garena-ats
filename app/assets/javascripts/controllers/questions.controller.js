angular.module('app').controller('QuestionsController', ['$scope', '$http', function($scope, $http) {
  $scope.searchText = '';

  $scope.questionsByTopic = [];
  $scope.topics = [];

  $scope.questions = [
    {
      topic: 'Android',
      difficulty: 'Easy',
      type: 'Multiple Answer',
      description: 'What is Android?',
      enabled: true
    },
    {
      topic: 'Networks',
      difficulty: 'Difficult',
      type: 'Subjective Text',
      description: 'Explain the difference between TCP and UDP',
      enabled: false
    },
    {
      topic: 'Algorithms and Data Structures',
      difficulty: 'Medium',
      type: 'Subjective Code',
      description: 'Write a function to perform merge sort on an array of numbers',
      enabled: true
    }
  ];

  // $.ajax({
  //   method: "POST",
  //   url: "/question/query",
  //   data: {
  //     topic : 'and'
  //   }
  // }).success(function(data) {
  //   alert(JSON.stringify(data));
  //
  //   $scope.$apply(function(){
  //     for (var x = 0; x < data.length; x++) {
  //       if (!$scope.topics[data[x].field_token]) {
  //         $scope.topics[data[x].field_token] = $scope.topics.length;
  //         $scope.questionsByTopic.push({
  //           topicToken: data[x].field_token,
  //           questions: []
  //         });
  //       }
  //       $scope.questionsByTopic[$scope.topics[data[x].field_token]].questions.push({
  //         description: data[x].description,
  //         type: data[x].question_type_name
  //       });
  //       alert(JSON.stringify($scope.questionsByTopic[$scope.topics[data[x].field_token]]));
  //     }
  //   });
  //
  //   alert(JSON.stringify($scope.questionsByTopic));
  //   alert(JSON.stringify($scope.topics));
  //
  // }).error(function(data) {
  //   alert(JSON.stringify(data));
  // });

}]);
