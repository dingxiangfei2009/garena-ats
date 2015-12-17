angular.module('app').controller('EditAdminController', ['$scope','$http',
function($scope, $http){
'use strict';

function update() {
  $http.get('/admins/all').success(
    data => {
      $scope.old_data = Object.assign({}, data);
      $scope.data = data;
    });
}
update();

$scope.add = function() {
  $.ajax({
    url: '/admins/new',
    method: 'POST',
    data: {
      email: $scope.new_email,
      name: $scope.new_name
    }
  }).success(function() {
    update();
    $scope.$apply(() =>
      $scope.new_email = $scope.new_name = '');
  });
};
$scope.new_email = $scope.new_name = '';
$scope.destroy = function(email) {
  $.ajax({
    url: '/admins/destroy',
    method: 'POST',
    data: {
      email: email
    }
  }).success(update);
};

$scope.update = function(id, email, name) {
  $.ajax({
    url: '/admins/update',
    method: 'POST',
    data: {
      id: id,
      email: email,
      name: name
    }
  }).success(update);
};

}]);
