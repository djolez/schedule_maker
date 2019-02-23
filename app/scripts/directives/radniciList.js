angular.module('scheduleMakerApp')
  .directive('radniciList', function(){
      return {
        restrict: 'E',
        scope: {
          radnici: "=",
          selected: "=",
          currentMonth: "=",
          disableNeradniDani: "=",
          resetNeradniDani: "=",
          izbrisiIzRasporeda: "="
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
                radnik.neradniDani[i] = moment(radnik.neradniDani[i]);
              }
            }

            $scope.radnikEdit = radnik;
            $scope.neradniDani = radnik.neradniDani;
          };


          $scope.closeRadnikEdit = function() {
            $scope.radnikEdit = null;
            $scope.resetNeradniDani();
            $scope.disableNeradniDani($scope.selected);
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


            // $scope.radnikEdit = null;

            // radnik.selected = !radnik.selected;
            //
            // if(radnik.selected) {
            //   $scope.selected[radnik.id] = radnik;
            //
            //   disableDaysFromSelected();
            // }
            // else {
            //   delete $scope.selected[radnik.id];
            //
            //   // Obrisi disejblovane dane i prodji ponovo kroz ostale selektovane radnike
            //   $scope.resetNeradniDani();
            //
            //   for (var id in $scope.selected) {
            //       if ($scope.selected.hasOwnProperty(id)) {
            //           $scope.disableNeradniDani($scope.selected[id]);
            //
            //           // $scope.selected[id].neradniDani.forEach(function(dan) {
            //           //   $scope.raspored.dani[moment(dan).day()-2].disabled = true;
            //           // });
            //       }
            //   }
            // }
          };


	      }
      }
});
