angular.module('app').controller('QuestionsController', ['$scope', '$http', '$sce', function($scope, $http, $sce) {
  $scope.searchText = '';

  $scope.questionsByTopic = [];
  $scope.topics = [];
  $scope.difficulties = ["Easy", "Medium", "Difficult"];
  $scope.types = [];

  $scope.types["mas"] = "Multiple Answer";
  $scope.types["sbt"] = "Subjective Text";
  $scope.types["sbc"] = "Subjective Code";

  $scope.questions = [];

  $.ajax({
    method: "POST",
    url: "/question/query"
  }).success(function(data) {
    alert(JSON.stringify(data));

    $scope.$apply(function(){
      for (var x = 0; x < data.length; x++) {
        // if (!$scope.topics[data[x].field_token]) {
        //   $scope.topics[data[x].field_token] = $scope.topics.length;
        //   $scope.questionsByTopic.push({
        //     topicToken: data[x].field_token,
        //     questions: []
        //   });
        // }
        // $scope.questionsByTopic[$scope.topics[data[x].field_token]].questions.push({
        //   description: data[x].description,
        //   type: data[x].question_type_name
        // });
        // alert(JSON.stringify($scope.questionsByTopic[$scope.topics[data[x].field_token]]));
        $scope.questions.push({
          id: data[x].id,
          topic: data[x].field_name,
          difficulty: $scope.difficulties[data[x].difficulty - 1],
          type: $scope.types[data[x].question_type_name],
          description: $sce.trustAsHtml(data[x].description),
          enabled: data[x].enabled
        });
      }
    });

    alert(JSON.stringify($scope.questionsByTopic));
    alert(JSON.stringify($scope.topics));

  }).error(function(data) {
    alert(JSON.stringify(data));
  });

  $scope.disable = function(question) {
    $.ajax({
      method: "POST",
      url: "/question/" + question.id + "/disable"
    }).success(function(data) {
      alert(JSON.stringify(data));
      $scope.$apply(function(){
        question.enabled = false;
      });
    });
  }

  $scope.enable = function(question) {
    $.ajax({
      method: "POST",
      url: "/question/" + question.id + "/enable",
      data: {
        id: question.id
      }
    }).success(function(data) {
      alert(JSON.stringify(data));
      $scope.$apply(function(){
        question.enabled = true;
      });
    });
  }

}]);
