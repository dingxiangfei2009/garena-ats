angular.module('app').controller('TestsController',
["$scope", "$http", '$timeout',
function($scope, $http, $timeout) {
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
    for (var x = 0; x < data.length; x++) {
      $scope.positions.push({
        name: data[x].title,
        value: data[x].id
      });
    }
  });

  function query(options) {
    $.ajax({
      method: 'POST',
      url: '/test/query',
      data: options
    })
    .success(function(data) {
      $scope.$apply(function() {
        $scope.searching = false;
        $scope.tests.length = 0;
        $scope.total = Number(data.count);
        $scope.offset = Number(data.offset);
        if (!($scope.offset < $scope.total))
          $scope.offset = Math.max(0, $scope.total);
        $scope.page_length = data.tests.length;
        data.tests.forEach(function(test) {
          $scope.tests.push({
            id: test.id,
            jobId: test.job_id,
            title: test.job_title,
            applicationId: test.application_id,
            applicationStatus: test.application_status,
            candidateId: test.candidate_id,
            candidateName: test.candidate_name,
            candidateEmail: test.candidate_email,
            mark: test.mark,
            totalMark: test.total_mark,
          });
        });
      });
    });
  }
  query();

  function search(is_offset) {
    $scope.searching = true;
    query({
      job: $scope.position,
      candidate: $scope.applicant,
      offset: is_offset ?
        Math.min($scope.total, Math.max(0, $scope.offset)) || 0 :
        0
    });
  }

  var search_timeout;
  $scope.prepare_search = function () {
    $timeout.cancel(search_timeout);
    search_timeout = $timeout(search, 400);
  };

  $scope.setNewPosition = function (pos) {
    $scope.newCandidate.pos = pos;
  };

  $scope.submit = function () {
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
        })
        .success(function(data) {
          location.reload();
        })
        .error(function(data) {
          $('.ui.modal.error').modal('show');
        });
      });
    });
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

  setTimeout(function(){
    $('.ui.modal.invite')
      .modal('attach events', '.green.button', 'show')
    ;
  }, 0);

  $('.ui.selection.dropdown').dropdown();

}]);
