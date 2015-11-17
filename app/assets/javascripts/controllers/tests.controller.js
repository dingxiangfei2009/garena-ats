angular.module('app').controller('TestsController', ["$scope", "$http", function($scope, $http) {
  $scope.searchText = '';

  $scope.newCandidate = {
    position: '',
    name: '',
    duration: 0,
    email: ''
  };

  $scope.tests = [];

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

  $http({
    method: "GET",
    url: "/test/query"
  })
  .success(function(data) {
    alert(JSON.stringify(data));
    for (var x = 0; x < data.length; x++) {
      $scope.tests.push({
        id: data[x].id,
        jobId: data[x].job_id,
        title: data[x].job_title,
        applicationId: data[x].application_id,
        applicationStatus: data[x].application_status,
        candidateId: data[x].candidate_id,
        candidateName: data[x].candidate_name,
        candidateEmail: data[x].candidate_email,
        mark: data[x].mark,
        totalMark: data[x].total_mark,
      });
    }
  });


  $scope.setNewPosition = function (pos) {
    $scope.newCandidate.pos = pos;
  };

  $scope.submit = function () {
    $scope.tests.push({
      title: $scope.newCandidate.pos.name,
      candidateName: $scope.newCandidate.name,
      applicationStatus: null,
      mark: 0
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
            duration: $scope.newCandidate.duration*60,
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
