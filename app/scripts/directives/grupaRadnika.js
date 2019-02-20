angular.module('scheduleMakerApp')
  .directive('grupaRadnika', function(){
      return {
        restrict: 'E',
        scope: {
          list: "=",
          type: "=",
          smenaDodaj: "=",
          start: "=",
          dragging: "=",
          moved: "=",
          smenaDrop: "=",
          selected: "="
        },
        templateUrl: '../../views/partials/grupa_radnika.html',
        link: function($scope, element) {
          // console.log($scope.list, $scope.type);
          //
          // $scope.$watch('list', function(newValue, oldValue){
          //   $scope.list = newValue;
          //     console.log('list : ' + $scope.list);
          // }, true);
        }
      }
});
