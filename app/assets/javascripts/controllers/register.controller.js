angular.module('app').controller('RegisterController', ['$scope', '$http', '$sce', function($scope, $http, $sce) {

  $scope.positions = [];

  $scope.firstName = '';
  $scope.lastName = '';
  $scope.mobileNo = '';
  $scope.email = '';
  $scope.position = '';
  $scope.githubId = '';
  $scope.skills = '';

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

  $scope.setNewPosition = function(pos) {
    $scope.position = pos.name;
  };

  $scope.submit = function (){
    alert(JSON.stringify($scope.firstName + ' ' +
      $scope.lastName + ' ' +
      $scope.mobileNo + ' ' +
      $scope.email + ' ' +
      $scope.position + ' ' +
      $scope.githubId + ' ' +
      $scope.skills + ' '
    ));
    $('.ui.modal').modal('show');
  }

}]);
