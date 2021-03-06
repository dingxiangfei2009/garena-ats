angular.module('app').controller('QuestionsController',
['$scope', '$http', '$sce', '$timeout',
function($scope, $http, $sce, $timeout) {
'use strict';

  $scope.searchText = $scope.keyword = '';

  $scope.topics = [];
  $scope.difficulties = ["Easy", "Medium", "Difficult"];
  $scope.question_types = {
    mas: "Multiple Answer",
    sbt: "Subjective Text",
    sbc: "Subjective Code",
    fib: "Fill in the Blanks"
  };
  $scope.questions = [];

  $http.get('/topics/all').success(function(data) {
    $scope.topics = data;
    $scope.topics_by_token = {};
    data.forEach(topic => $scope.topics_by_token[topic.token] = topic.name);
  });

  function query(options) {
    $.ajax({
      method: "POST",
      url: "/question/query",
      data: options
    }).success(function(data) {
      $scope.$apply(function(){
        $scope.questions.length = 0;
        $scope.searching = false;
        $scope.total = Number(data.count);
        $scope.offset = Number(data.offset);
        if (!($scope.offset < $scope.total))
          $scope.offset = Math.max(0, $scope.total);
        $scope.page_length = data.questions.length;
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
  query();

  $scope.disable = function(question, index) {
    $.ajax({
      method: "POST",
      url: "/question/" + question.id + "/disable"
    }).success(function(data) {
      $scope.$apply(function(){
        $scope.questions[index].enabled = false;
      });
    });
  };

  $scope.enable = function(question, index) {
    $.ajax({
      method: "POST",
      url: "/question/" + question.id + "/enable"
    }).success(function(data) {
      $scope.$apply(function(){
        $scope.questions[index].enabled = true;
      });
    });
  };

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
  function search(is_offset) {
    $scope.searching = true;
    query({
      disabled: !$scope.is_showing_enabled,
      keyword: $scope.keyword,
      topic: $scope.selected_topic,
      type: $scope.selected_question_type,
      offset: is_offset ?
        Math.min($scope.total, Math.max(0, $scope.offset)) || 0 :
        0
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

  $scope.next = function() {
    $scope.offset = Math.min(
      $scope.page_length - 1,
      $scope.offset + $scope.page_length);
    search(true);
  };
  $scope.prev = function() {
    $scope.offset = Math.max(0, $scope.offset - $scope.page_length);
    search(true);
  };
  $scope.head = function() {
    $scope.offset = 0;
    search(true);
  };
  $scope.tail = function() {
    $scope.offset = $scope.total - 1;
    search(true);
  };
  $scope.offset = 0;

}]);
