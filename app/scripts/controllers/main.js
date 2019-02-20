'use strict';

/**
 * @ngdoc function
 * @name scheduleMakerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the scheduleMakerApp
 */
angular.module('scheduleMakerApp')
  .controller('MainCtrl', function ($scope, $uibModal, $sce, $http, $interval, $timeout) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    moment.updateLocale('sr', {
      week: {
        dow: 1,
      },
    });

    $scope.models = {'selected': null};
    $scope.selected = {};
    $scope.selectedKuvarice = [];
    $scope.selectedKonobari = [];
    $scope.radnikEdit = null;
    $scope.radnikDragging = null;
    $scope.neradniDani = [];

    var kuvarice = [{'ime': 'Milena', 'boja': '#F07B19', 'type': 'kuvarica'},
                    {'ime': 'Jelena', 'boja': '#B4C60B', 'type': 'kuvarica'},
                    {'ime': 'Anita', 'boja': '#815955', 'type': 'kuvarica'},
                    {'ime': 'Daliborka', 'boja': '#1D3B44', 'type': 'kuvarica'},
                    {'ime': 'Sandra', 'boja': '#94A68C', 'type': 'kuvarica'},
                    {'ime': 'Dejana', 'boja': '#70CEBA', 'type': 'kuvarica'}];

    var konobari = [{'ime': 'Srdjan', 'boja': '#F07B19', 'type': 'konobar'},
                    {'ime': 'Ivica', 'boja': '#B4C60B', 'type': 'konobar'},
                    {'ime': 'Darko', 'boja': '#815955', 'type': 'konobar'},
                    {'ime': 'Darko 1', 'boja': '#1D3B44', 'type': 'konobar'},
                    {'ime': 'Dragan', 'boja': '#94A68C', 'type': 'konobar'},
                    {'ime': 'Daka', 'boja': '#70CEBA', 'type': 'konobar'}];

    // var konobari = ['Srdjan', 'Ivica', 'Darko', 'Daka'];
    // var kuvarice = ['Milena', 'Jelena', 'Anita', 'Daliborka'];

    function getDaysArrayByDate(date) {
      var daysInMonth = moment(date).daysInMonth();

      var arrDays = [];
      var i = 0;
      var currentDay = date;

      while(i < daysInMonth) {
        arrDays.push(currentDay.format('DD-ddd'));
        currentDay = moment(currentDay).add(1, 'days');
        i++;
      }

      return arrDays;
    }

    $scope.osveziModel = function(izabraniMesec) {
      console.log('Osvezi ' + moment(izabraniMesec));

      var daniUmesecu = getDaysArrayByDate(izabraniMesec);
      $scope.raspored.dani = [];

      daniUmesecu.forEach(function(dan) {
        $scope.raspored.dani.push({
          'ime': dan,
          'nedelja': dan.includes('Ned'),
          'radnici': {
            'kuvarice': {
              'smene': [[], [], []],
              'disabled': false
            },
            'konobari': {
              'smene': [[], [], []],
              'disabled': false
            }
          }
        });
      });
    }

    function napraviModel() {
      $scope.radnici = {'konobari': [], 'kuvarice': []}
      var id = 1;

      konobari.forEach(function(k, i) {
        k.id = id;
        k.neradniDani = [];
        k.ukupnoDana = 0;
        $scope.radnici.konobari.push(k);

        // $scope.radnici.konobari.push({'id': id, 'ime': k.ime, 'boja': k.boja, 'neradniDani': [], 'ukupnoDana': 0, neradniDani: []});
        id++;
      });

      kuvarice.forEach(function(k, i) {
        k.id = id;
        k.neradniDani = [];
        k.ukupnoDana = 0;
        $scope.radnici.kuvarice.push(k);

        // $scope.radnici.kuvarice.push({'id': id, 'ime': k.ime, 'boja': k.boja, 'neradniDani': [], 'ukupnoDana': 0});
        id++;
      });

      // var nextMonth = moment().endOf('month').add(1, "days");
      // var daniUmesecu = getDaysArrayByDate(nextMonth);

      var thisMonth = moment();
      var currentDate = angular.copy(thisMonth);
      var allMonths = [];

      // U dropdownu se prikazuje ukupno 12 meseci, 10 pre trenutnog, trenutni i sledeci
      for(var i = 0; i < 11; i++) {
        currentDate = currentDate.startOf('month').subtract(1, 'days').startOf('month');
        allMonths.push(angular.copy(currentDate));
      }

      allMonths.unshift(angular.copy(thisMonth.startOf('month')));
      allMonths.unshift(angular.copy(thisMonth.endOf('month').add(1, 'days')));

      $scope.raspored.meseci = [];

      allMonths.forEach(function(month){
        var monthModel = {'dani': [], 'ime': moment(month).format('MMMM-YYYY'), 'momentModel': month};

        var daniUmesecu = getDaysArrayByDate(month);

        daniUmesecu.forEach(function(dan) {
          monthModel.dani.push({
            'ime': dan,
            'nedelja': dan.includes('Ned'),
            'radnici': {
              'kuvarice': {
                'smene': [[], [], []],
                'disabled': false
              },
              'konobari': {
                'smene': [[], [], []],
                'disabled': false
              }
            }
          });
        });

        $scope.raspored.meseci.push(angular.copy(monthModel));
      });
      console.log($scope.raspored);

      $scope.aktivniMesec = $scope.raspored.meseci[0];

      // $scope.raspored = {'meseci': allMonths, 'izabraniMesec': allMonths[0], 'dani': []};
      //
      // $scope.osveziModel($scope.raspored.izabraniMesec);
    }

    $scope.raspored = {};

    $http.get("http://localhost:5000/model")
      .then(function (response) {
          console.log('receive response', response);
          if(Object.entries(response.data).length === 0 && response.data.constructor === Object) {
            console.log('Model empty, need to initialize');
            napraviModel();
          } else {
            console.log('Received model from server');

            response.data.aktivniMesec.momentModel = moment(response.data.aktivniMesec.momentModel);
            $scope.aktivniMesec = response.data.aktivniMesec;
            $scope.radnici = response.data.radnici;
          }

          return response;
      }, function (response) {
          return response;
      });


    $scope.sacuvajModel = function() {
      console.log('cuvam');

      $http.post("http://localhost:5000/model", {'aktivniMesec': $scope.aktivniMesec, 'radnici': $scope.radnici}, {headers: {'Content-Type': 'application/json'} })
        .then(function (response) {
            $scope.savedModel = true;
            $timeout(function() {
              $scope.savedModel = false;
            }, 2000);

            return response;
        }, function (response) {
            return response;
        });
    };

    $interval(function() {
      $scope.sacuvajModel();
    }, 60000);

    // if($scope.raspored === {} || !$scope.raspored)
    //   napraviModel();

    $scope.formatMonth = function(date) {
      return date.format('MMMM YYYY');
    };

    $scope.smenaDrop = function(radnik, smena) {
      var isContained = false;

      smena.forEach(function(r) {
        if(r.id === radnik.id)
          isContained = true;
      });

      if(!isContained && !smena.disabled) {
        smena.push(radnik);
        $scope.resetNeradniDani();
        return true;
      }

      $scope.resetNeradniDani();
      return false;
    };

    // $scope.radnikDragStart = function() {
    //   console.log("dragging");
    // };

    $scope.neradniDani = [];

    $scope.disableNeradniDani = function(radnik) {
      console.log("disable", radnik);

      radnik.neradniDani.forEach(function(dan) {
        // $scope.raspored.dani[moment(dan).date()-1].disabled = true;
        var smeneArray = [];

        if(radnik.type === 'kuvarica') {
          $scope.aktivniMesec.dani[moment(dan).date()-1].radnici.kuvarice.disabled = true;
          $scope.neradniDani.push($scope.aktivniMesec.dani[moment(dan).date()-1].radnici.kuvarice);
        }
          // smeneArray = $scope.raspored.dani[moment(dan).date()-1].radnici.kuvarice;
        else if(radnik.type === 'konobar') {
          $scope.aktivniMesec.dani[moment(dan).date()-1].radnici.konobari.disabled = true;
          $scope.neradniDani.push($scope.aktivniMesec.dani[moment(dan).date()-1].radnici.konobari);
        }
          // smeneArray = $scope.raspored.dani[moment(dan).date()-1].radnici.konobari;

        // smeneArray.forEach(function(s){
        //   s.disabled = true;
        // });
      });
    };

    $scope.resetNeradniDani = function() {
      $scope.neradniDani.forEach(function(d) {
        d.disabled = false;
      });
      $scope.neradniDani = [];
    };

    $scope.radnikDragStart = function(radnik) {
      $scope.radnikDragging = radnik.type;
      $scope.disableNeradniDani(radnik);
    };

    $scope.radnikMoved = function(smena, index) {
      smena.splice(index, 1);
      $scope.radnikDragging = null;
    };

    function containsObject(obj, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i] === obj) {
                return true;
            }
        }

        return false;
    }

    $scope.dodajUSmenu = function(radnici, smena, acceptedType) {
      console.log(radnici, smena, acceptedType);
      // Proveri da li je objekat sa selektovanim radnicima prazan
      if(Object.keys(radnici).length === 0 && radnici.constructor === Object) {
        console.log("Radnici empty");
        return;
      }

      for (var id in radnici) {
        if (radnici.hasOwnProperty(id)) {
          if(radnici[id].type !== acceptedType)
            continue;

          var contains = false;
          smena.forEach(function(r){
            if(r.id === parseInt(id))
              contains = true;
          });

          if(!contains) {
            smena.push(angular.copy(radnici[id]));
            $scope.uvecajDane(parseInt(id));
          }

          // if(!containsObject(radnici[id], smena)) {
          //   smena.push(angular.copy(radnici[id]));
          //   $scope.uvecajDane(parseInt(id));
          // }
        }
      }
    };

    $scope.izbrisiIzSmene = function(radnik, smena, radnikIndex) {
      $scope.smanjiDane(radnik.id);
      smena.splice(radnikIndex, 1);
    };

    function nadjiRadnikaPoID(id) {
      console.log('nadjiRadnikaPoID: ' + id);
      var res = null;

      $scope.radnici.konobari.forEach(function(r){
        if(r.id === id)
          res = r;
      });

      if(!res) {
        $scope.radnici.kuvarice.forEach(function(r){
          if(r.id === id)
            res = r;
        });
      }

      return res;
    }

    $scope.izbrisiIzRasporeda = function(id) {
      $scope.smanjiDane(id);
      $scope.resetNeradniDani();
      return true;
    };

    $scope.uvecajDane = function(id) {
      nadjiRadnikaPoID(id).ukupnoDana++;
    };

    $scope.smanjiDane = function(id) {
      nadjiRadnikaPoID(id).ukupnoDana--;
      return true;
    };

    // $scope.izmeniRadnika = function(radnik) {
    //   $scope.radnikEdit = radnik;
    //   $scope.neradniDani = radnik.neradniDani;
    // }

    $scope.$watch('neradniDani', function(newValue, oldValue){
        if(newValue){
            console.log('my array changed, new size : ' + newValue.length);
            console.log($scope.radnikEdit);

            if($scope.radnikEdit)
              $scope.radnikEdit.neradniDani = newValue;
        }
    }, true);

    $scope.popuniModel = function() {
      $scope.raspored.dani.forEach(function(d) {
        d.radnici.kuvarice.smene[0].push(angular.copy(kuvarice[0]));
        d.radnici.kuvarice.smene[1].push(angular.copy(kuvarice[1]));
        d.radnici.kuvarice.smene[1].push(angular.copy(kuvarice[2]));
        d.radnici.kuvarice.smene[2].push(angular.copy(kuvarice[3]));
        d.radnici.kuvarice.smene[2].push(angular.copy(kuvarice[4]));

        d.radnici.konobari.smene[0].push(angular.copy(konobari[0]));
        d.radnici.konobari.smene[1].push(angular.copy(konobari[1]));
        d.radnici.konobari.smene[1].push(angular.copy(konobari[2]));
        d.radnici.konobari.smene[2].push(angular.copy(konobari[3]));
        d.radnici.konobari.smene[2].push(angular.copy(konobari[4]));
      });

    };

    $scope.printToCart = function(printSectionId) {
      // console.log($scope.raspored);
      // return;

      setTimeout(function(){
        var bodyContents = document.getElementById("raspored-body").innerHTML;
        var tableContents = document.getElementById("radnici-table").innerHTML;
        var radniciList = document.getElementsByClassName("radnici-list");


        var allContent = "";
        allContent += `
          <html>
            <head>
              <meta name="description" content="">
              <meta name="viewport" content="width=device-width">
              <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.css" media="all">
              <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous">

              <link rel="stylesheet" href="/app/styles/main.css">
            </head>

            <body class="print">
              <script src="/bower_components/jquery/dist/jquery.js"></script>
              <script src="/bower_components/angular/angular.js"></script>
              <script src="/bower_components/bootstrap/dist/js/bootstrap.js"></script>
              <script src="/bower_components/angular-animate/angular-animate.js"></script>
              <script src="/bower_components/angular-cookies/angular-cookies.js"></script>
              <script src="/bower_components/angular-resource/angular-resource.js"></script>
              <script src="/bower_components/angular-route/angular-route.js"></script>
              <script src="/bower_components/angular-sanitize/angular-sanitize.js"></script>
              <script src="/bower_components/angular-touch/angular-touch.js"></script>
              <script src="/bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js"></script>
              <script src="/bower_components/moment/min/moment.min.js"></script>
              <script src="/bower_components/moment/locale/sr.js"></script>
              <script src="/bower_components/angular-ui/build/angular-ui.js"></script>
              <script src="/bower_components/angular-multiple-date-picker/dist/multipleDatePicker.min.js"></script>
              <script src="/bower_components/ngSticky/lib/sticky.js"></script>
              <!-- endbower -->
              <!-- endbuild -->

              <!-- build:js({.tmp,app}) scripts/scripts.js -->
              <script src="/app/scripts/app.js"></script>
              <script src="/app/scripts/controllers/main.js"></script>
              <div>
              ` +
                '<div class="col-lg-12" style="margin-bottom: 15px;">' +
                  '<h4 style="text-align: center; margin-top: 0; margin-bottom: 10px;">' +
                    // $scope.raspored.izabraniMesec.format('MMMM YYYY') +
                    $scope.aktivniMesec.momentModel.format('MMMM YYYY') +
                  '</h4>' +
                  tableContents +
                '</div>' +
                '<div class="col-lg-6" style="padding-left: 3px;">' +
                  radniciList[0].outerHTML +
                '</div>' +
                '<div class="col-lg-6">' +
                  radniciList[1].outerHTML +
                '</div>' +
                '<script>window.print()</script>' +
            `
              </div>
            </body>
          </html>`;

        // console.log(allContent);

        var popupWinindow = window.open('', '_blank', 'width=1920,height=2000,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write(allContent);
        popupWinindow.document.close();

      }, 300);


    }
});
