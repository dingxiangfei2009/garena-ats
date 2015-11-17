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
    $scope.position = pos.value;
  };

  $scope.submit = function (){
    console.log($scope.skills);
    $.ajax({
      url: '/applicants',
      method: 'POST',
      data: {
        email: $scope.email,
        name: $scope.firstName + ' ' + $scope.lastName,
        first_name: $scope.firstName,
        last_name: $scope.lastName,
        fields: JSON.stringify($scope.skills),
        description: JSON.stringify({
          github_id: $scope.githubId,
          mobile_no: $scope.mobileNo
        })
      }
    }).then(function(data) {
      return $.ajax({
        url: `/applicants/${data.id}/job/${$scope.position}`,
        method: 'POST'
      });
    }).done(function() {
      $('.ui.modal').modal('show');
    });
  }

}]);
