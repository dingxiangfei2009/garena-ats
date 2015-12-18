angular.module('app').controller('TopicsController', ["$scope", "$http", function($scope, $http) {
  $scope.searchText = '';

  function pull() {
    $http({
      method: "GET",
      url: "/topics/all"
    })
    .success(function(data) {
      $scope.topics = data.map(topic => ({
        name: topic.name,
        token: topic.token,
        questions: topic.questions
      }));
    });
  }
  pull();

  $scope.submit = function () {
    $.ajax({
      method: "POST",
      url: "/topics/new",
      data: {
        name: $scope.newTopic.name,
        token: $scope.newTopic.token
      }
    })
    .success(pull)
    .error(function(data) {
      console.log(data);
      $('.ui.modal.error').modal('show');
    });
  };

  var editing_token;
  $scope.save_edit = function(){
    $.ajax({
      method: 'POST',
      url: '/topics/update',
      data: {
        token: editing_token,
        new_token: $scope.editTopic.token,
        name: $scope.editTopic.name
      }
    }).success(pull);
  };
  $scope.start_edit = function(topic){
    editing_token = topic.token;
    $scope.editTopic = {
      name: topic.name,
      token: topic.token
    };
    $('.ui.modal.edit').modal('show');
  };
  $scope.start_new = function() {
    $scope.newTopic = {
      name: '',
      token: ''
    };
    $('.ui.modal.create').modal('show');
  };
  $scope.remove = function(token){
    $.ajax({
      method: 'POST',
      url: '/topics/destroy',
      data: {
        token: token
      }
    }).success(pull);
  };

}]);
