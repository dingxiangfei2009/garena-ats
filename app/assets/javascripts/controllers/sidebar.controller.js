angular.module('app').controller('SidebarController', function($scope) {

    $scope.state = false;
    $scope.activeId = '';

    $scope.toggleState = function() {
        $scope.state = !$scope.state;
    };
    $scope.clickAlert = function(idName) {
      // alert("You clicked me " + idName);
      $('#' + idName).addClass('active');
      $('#' + $scope.activeId).removeClass('active');
      $scope.activeId = idName;
    }

});
