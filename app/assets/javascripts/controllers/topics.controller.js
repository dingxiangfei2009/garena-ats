angular.module('app').controller('TopicsController', ["$scope", "$http", function($scope, $http) {
  $scope.searchText = '';

  $scope.newTopic = {
    name: '',
    token: ''
  };

  $scope.topics = [];

  $http({
    method: "GET",
    url: "/topics/all"
  })
  .success(function(data) {
    for (var x = 0; x < data.length; x++) {
      $scope.topics.push({
        name: data[x].name,
        token: data[x].token,
        questions: data[x].questions
      });
    }
  });


  $scope.submit = function () {
    // $scope.tests.push({
    //   title: $scope.newCandidate.pos.name,
    //   candidateName: $scope.newCandidate.name,
    //   applicationStatus: null,
    //   mark: 0
    // });
    $.ajax({
      method: "POST",
      url: "/topics/new",
      data: {
        name: $scope.newTopic.name,
        token: $scope.newTopic.token
      }
    })
    .success(function(data){
      location.reload();
    })
    .error(function(data) {
      console.log(data);
      $('.ui.modal.error').modal('show');
    });
    ;
  };

  setTimeout(function(){
    $('.ui.modal.create')
      .modal('attach events', '.green.button', 'show')
    ;
  }, 0);



}]);
