angular.module('app').controller('TestsController', function($scope) {
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

  $scope.positions = [
    {
      name: 'Android Developer',
      value: 'AND'
    },
    {
      name: 'Data Scientist',
      value: 'DAT'
    },
    {
      name: 'Security Engineer',
      value: 'SEC'
    },
    {
      name: 'System Admin',
      value: 'SYS'
    },
    {
      name: 'Web Developer',
      value: 'WEB'
    }
  ];

  $scope.setNewPosition = function (pos) {
    $scope.newCandidate.pos = pos.name;
  };

  $scope.submit = function () {
    $scope.tests.push({
      position: $scope.newCandidate.pos,
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
        url: "/applicants/" + data.id + "/job/" + 1,
      })
      .success(function(data){
        $.ajax({
          method: "POST",
          url: "/test",
          data: {
            email: $scope.newCandidate.email,
            duration: $scope.newCandidate.duration,
            job: 1
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



});
