angular.module('app').controller('TestsController', function($scope) {
  $scope.searchText = '';

  $scope.newCandidate = {
    position: '',
    name: '',
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
  };

  setTimeout(function(){
    $('.ui.modal')
      .modal('attach events', '.green.button', 'show')
    ;
  }, 0);

  $('.ui.selection.dropdown')
    .dropdown()
  ;



});
