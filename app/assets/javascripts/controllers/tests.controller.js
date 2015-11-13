angular.module('app').controller('TestsController', ["$scope", "$http", function($scope, $http) {
  $scope.searchText = '';

  $scope.newCandidate = {
    position: '',
    name: '',
    duration: 0,
    email: ''
  };

  $scope.tests = [
    {
      position: 'Android Developer',
      candidate: 'Ding Xiangfei',
      complete: 'Evaluate',
      score: '-'
    },
    {
      position: 'Web Developer',
      candidate: 'Qunfeng Ye',
      complete: 'Not Completed',
      score: '-'
    },
    {
      position: 'Security Engineer',
      candidate: 'Anand Sundaram',
      complete: 'View Report',
      score: '17/20'
    },
    {
      position: 'Data Scientist',
      candidate: 'Zhao Cong',
      complete: 'View Report',
      score: '9/10'
    }
  ];

  $scope.positions = [];

  $http({
    method: "GET",
    url: "/job"
  })
  .success(function(data) {
    alert(JSON.stringify(data));
    for (var x = 0; x < data.length; x++) {
      $scope.positions.push({
        name: data[x].title,
        value: data[x].id
      });
    }
  });


  $scope.setNewPosition = function (pos) {
    $scope.newCandidate.pos = pos;
  };

  $scope.submit = function () {
    $scope.tests.push({
      position: $scope.newCandidate.pos.name,
      candidate: $scope.newCandidate.name,
      complete: 'Not Completed',
      score: '-'
    });
    $.ajax({
      method: "POST",
      url: "/applicants",
      data: {
        name: $scope.newCandidate.name,
        email: $scope.newCandidate.email
      }
    })
    .success(function(data){
      $.ajax({
        method: "POST",
        url: "/applicants/" + data.id + "/job/" + $scope.newCandidate.pos.value,
      })
      .success(function(data){
        $.ajax({
          method: "POST",
          url: "/test",
          data: {
            email: $scope.newCandidate.email,
            duration: $scope.newCandidate.duration,
            job: $scope.newCandidate.pos.value
          }
        }).error(function(data) {
          console.log(data);
          $('.ui.modal.error').modal('show');
        });
      });
    })
    ;
  };

  setTimeout(function(){
    $('.ui.modal.invite')
      .modal('attach events', '.green.button', 'show')
    ;
  }, 0);

  $('.ui.selection.dropdown')
    .dropdown()
  ;



}]);
