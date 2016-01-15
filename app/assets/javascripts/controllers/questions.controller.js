angular.module('app').controller('QuestionsController', ['$scope', '$http', '$sce', function($scope, $http, $sce) {
  $scope.searchText = '';

  $scope.questionsByTopic = [];
  $scope.topics = [];
  $scope.difficulties = ["Easy", "Medium", "Difficult"];
  $scope.types = [];

  $scope.types["mas"] = "Multiple Answer";
  $scope.types["sbt"] = "Subjective Text";
  $scope.types["sbc"] = "Subjective Code";
  $scope.types["fib"] = "Fill in the Blanks";

  $scope.questions = [];

  $.ajax({
    method: "POST",
    url: "/question/query"
  }).success(function(data) {

    $scope.$apply(function(){
      for (var x = 0; x < data.length; x++) {
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

  }).error(function(data) {
  });

  $scope.disable = function(question, index) {
    $.ajax({
      method: "POST",
      url: "/question/" + question.id + "/disable"
    }).success(function(data) {
      $scope.$apply(function(){
        $scope.questions[index].enabled = false;
      });
    });
  }

  $scope.enable = function(question, index) {
    $.ajax({
      method: "POST",
      url: "/question/" + question.id + "/enable"
    }).success(function(data) {
      $scope.$apply(function(){
        $scope.questions[index].enabled = true;
      });
    });
  }

}]);
