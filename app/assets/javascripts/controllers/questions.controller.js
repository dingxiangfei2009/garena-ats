angular.module('app').controller('QuestionsController',
['$scope', '$http', '$sce', '$timeout',
function($scope, $http, $sce, $timeout) {
'use strict';

  $scope.searchText = $scope.keyword = '';

  $scope.questionsByTopic = [];
  $scope.topics = [];
  $scope.difficulties = ["Easy", "Medium", "Difficult"];
  $scope.question_types = {
    mas: "Multiple Answer",
    sbt: "Subjective Text",
    sbc: "Subjective Code",
    fib: "Fill in the Blanks"
  };


  $scope.questions = [];

  $http.get('/topics/all').success(data => $scope.topics = data);

  function query(options) {
    $.ajax({
      method: "POST",
      url: "/question/query",
      data: options
    }).success(function(data) {
      $scope.$apply(function(){
        $scope.questions.length = 0;
        $scope.searching = false;
        data.questions.forEach(function(question) {
          $scope.questions.push({
            id: question.id,
            topic: question.field_name,
            difficulty: $scope.difficulties[question.difficulty - 1],
            type: $scope.question_types[question.question_type_name],
            description: $sce.trustAsHtml(question.description),
            enabled: question.enabled
          });
        });
      });
    }).error(function(error) {
      $scope.$apply(() => void ($scope.searching = false));
      console.error(error);
    });
  }
  query(false);

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

  $scope.is_showing_enabled = true;
  $scope.show_enabled = function() {
    $scope.is_showing_enabled = true;
    search();
  };
  $scope.show_disabled = function() {
    $scope.is_showing_enabled = false;
    search();
  };

  var search_timeout;
  $scope.prepare_search = function () {
    $timeout.cancel(search_timeout);
    search_timeout = $timeout(search, 400);
  };
  function search() {
    $scope.searching = true;
    query({
      disabled: !$scope.is_showing_enabled,
      keyword: $scope.keyword,
      topic: $scope.selected_topic,
      type: $scope.selected_question_type
    });
  }

  $scope.select_topic = function(token) {
    $scope.selected_topic = token;
    search();
  };

  $scope.select_question_type = function(type) {
    $scope.selected_question_type = type;
    search();
  };

}]);
