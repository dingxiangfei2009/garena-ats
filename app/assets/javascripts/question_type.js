// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
angular.module('app').controller('QuestionTypeEditorController', [
'$scope','$http',
function($scope, $http) {
'use strict';
debugger;
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
$scope.setEdited = function(name) {
  $scope.edited[name] = true;
};
$scope.save = function () {
  var submission = {};
  for (var name in $scope.edited)
    if (edited[name])
      submission[name] = $scope.data[name];
  $.ajax({
    url: '/question_types',
    method: 'POST',
    data: {
      data: JSON.stringify(submission)
    }
  }).success(function () {
    $('#success').modal('show');
  });
};
}]);
