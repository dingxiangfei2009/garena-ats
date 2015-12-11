// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
angular.module('app').contorller('QuestionTypeEditorController', [
'$scope','$http',
function($scope, $http) {
'use strict';

var data = JSON.parse($('#data').val());
$scope.data = data;
$scope.canonical_name = {
  'mas': 'Multiple Answers',
  'sbt': 'Subjective Text',
  'sbc': 'Subjective Code',
  'fib': 'Fill In Blanks'
};
var edited = {};
Object.getOwnPropertyNames(data).forEach(key => edited[key] = false);
$scope.edited = edited;
$scope.save = function () {
  var submission = {};
  for (var name in $scope.edited)
    if (edited[name])
      submission[name] = $scope.data[name];
  $.ajax({
    url: '/question_types/save',
    method: 'POST',
    data: {
      data: JSON.stringify(submission)
    }
  }).success(function () {
    $('#success').modal('show');
  });
};
}]);
