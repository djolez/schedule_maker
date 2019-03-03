angular.module('scheduleMakerApp')
  .directive('radniciList', function(NeradniDanEnum){
      return {
        restrict: 'E',
        scope: {
          radnici: "=",
          selected: "=",
          currentMonth: "=",
          disableNeradniDani: "=",
          resetNeradniDani: "=",
          izbrisiIzRasporeda: "=",
          formDirty: "=",
        },
        templateUrl: '../../views/partials/radnici_list.html',
        link: function($scope, element) {
          $scope.radnikEdit = null;

          $scope.izmeniRadnika = function(radnik) {
            if($scope.radnikEdit && $scope.radnikEdit.id === radnik.id) {
              $scope.closeRadnikEdit();
              return;
            }

            if(radnik.neradniDani && radnik.neradniDani.length > 0) {
              for(var i = 0; i < radnik.neradniDani.length; i++) {
                radnik.neradniDani[i].moment = moment(radnik.neradniDani[i].moment);
              }
            }

            $scope.radnikEdit = radnik;
            $scope.neradniDani = radnik.neradniDani;
          };

          $scope.neradniDani = [];
          $scope.neradniDanEnum = NeradniDanEnum;
          $scope.neradniDanTypeModel = NeradniDanEnum.Slobodan;

          $scope.$watch('neradniDani', function(newValue, oldValue){
              if(newValue) {
                  if($scope.radnikEdit)
                    $scope.radnikEdit.neradniDani = angular.copy(newValue);
              }
          }, true);

          $scope.dayClick = function(e, day) {
            day.mdp.dayType = $scope.neradniDanTypeModel;
          };

          $scope.closeRadnikEdit = function() {
            $scope.radnikEdit = null;
            $scope.resetNeradniDani();
            $scope.disableNeradniDani($scope.selected);
            $scope.formDirty = true;
          };

          $scope.radnikSelect = function(radnik) {
            $scope.radnikEdit = null;

            if($scope.selected && $scope.selected.id === radnik.id) {
              $scope.selected = null;
              $scope.resetNeradniDani();
              return;
            }
            $scope.resetNeradniDani();

            $scope.selected = radnik;
            $scope.disableNeradniDani($scope.selected);
          };


	      }
      }
});
