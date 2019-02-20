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
            $scope.radnikEdit = radnik;
            $scope.neradniDani = radnik.neradniDani;
          };

          function disableDaysFromSelected() {
            // Disejbluj sve dane koji su u preseku neradnih dana selektovanih radnika
            for (var id in $scope.selected) {
                if ($scope.selected.hasOwnProperty(id)) {
                    $scope.disableNeradniDani($scope.selected[id]);

                    // $scope.selected[id].neradniDani.forEach(function(dan) {
                    //   $scope.raspored.dani[moment(dan).day()-2].disabled = true;
                    // });
                }
            }
          }

          $scope.closeRadnikEdit = function() {
            $scope.radnikEdit = null;
            disableDaysFromSelected();
          };

          $scope.radnikSelect = function(radnik) {
            $scope.radnikEdit = null;

            radnik.selected = !radnik.selected;

            if(radnik.selected) {
              $scope.selected[radnik.id] = radnik;

              disableDaysFromSelected();
            }
            else {
              delete $scope.selected[radnik.id];

              // Obrisi disejblovane dane i prodji ponovo kroz ostale selektovane radnike
              $scope.resetNeradniDani();

              for (var id in $scope.selected) {
                  if ($scope.selected.hasOwnProperty(id)) {
                      $scope.disableNeradniDani($scope.selected[id]);

                      // $scope.selected[id].neradniDani.forEach(function(dan) {
                      //   $scope.raspored.dani[moment(dan).day()-2].disabled = true;
                      // });
                  }
              }
            }
          };
	      }
      }
});
