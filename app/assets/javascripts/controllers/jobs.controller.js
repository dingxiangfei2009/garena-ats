angular.module('app').controller('JobsController', ['$scope', '$http', function($scope, $http) {

  $scope.jobs = [];
  $http({
    method: "GET",
    url: "/job"
  })
  .success(function(data) {
    $scope.jobs = data;
  });

  $scope.deleteJob = id =>
    $.ajax({
      url: `/job/${id}/delete`,
      method: 'POST'
    }).success(() => location.reload());

}]);
