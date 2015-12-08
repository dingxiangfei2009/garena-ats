angular.module('app').controller('TestAdminController', ["$scope", "$http", function($scope, $http) {
  $scope.searchText = '';

  $scope.newAdmin = {
    name: '',
    email: ''
  };

  $scope.admins = [];

  $http({
    method: "GET",
    url: "/admin/all"
  })
  .success(function(data) {
    for (var x = 0; x < data.length; x++) {
      $scope.admins.push({
        name: data[x].name,
        email: data[x].email
      });
    }
  });


  $scope.submit = function () {
    $.ajax({
      method: "POST",
      url: "/admin/new",
      data: {
        name: $scope.newAdmin.name,
        email: $scope.newAdmin.email
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
