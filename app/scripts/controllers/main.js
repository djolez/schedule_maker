'use strict';

/**
 * @ngdoc function
 * @name scheduleMakerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the scheduleMakerApp
 */
angular.module('scheduleMakerApp')
  .controller('MainCtrl', function ($scope, $uibModal, $sce, $http, $interval, $timeout, NeradniDanEnum) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.PRODUCTION = true;
    var AUTO_SAVE_INTERVAL = 3 * 60 * 1000;

    moment.updateLocale('sr', {
      week: {
        dow: 1,
      },
    });

    // $scope.selected = {};
    $scope.selectedKuvarica = null;
    $scope.selectedKonobar = null;
    $scope.selectedRadnik = null;
    $scope.radnikEdit = null;
    $scope.radnikDragging = null;

    $scope.neradniDanEnum = NeradniDanEnum;

    var kuvarice = [{'ime': 'Milena', 'boja': '#F07B19', 'type': 'kuvarica'},
                    {'ime': 'Jelena', 'boja': '#B4C60B', 'type': 'kuvarica'},
                    {'ime': 'Anita', 'boja': '#815955', 'type': 'kuvarica'},
                    {'ime': 'Daliborka', 'boja': '#1D3B44', 'type': 'kuvarica'},
                    {'ime': 'Sandra', 'boja': '#94A68C', 'type': 'kuvarica'},
                    {'ime': 'Dejana', 'boja': '#70CEBA', 'type': 'kuvarica'},
					{'ime': 'Fanika', 'boja': '#F6A5EB', 'type': 'kuvarica'}];

    var konobari = [{'ime': 'Srdjan', 'boja': '#F07B19', 'type': 'konobar'},
                    {'ime': 'Ivica', 'boja': '#B4C60B', 'type': 'konobar'},
                    {'ime': 'Darko', 'boja': '#815955', 'type': 'konobar'},
                    {'ime': 'Milan', 'boja': '#1D3B44', 'type': 'konobar'},
                    {'ime': 'Dragan', 'boja': '#94A68C', 'type': 'konobar'},
                    {'ime': 'Daka', 'boja': '#70CEBA', 'type': 'konobar'}];

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

    function napraviModel(model) {
      var id = 1;

      konobari.forEach(function(k, i) {
        k.id = id;
        k.neradniDani = [];
        k.ukupnoDana = 0;
        model.radnici.konobari.push(k);

        // $scope.model.radnici.konobari.push({'id': id, 'ime': k.ime, 'boja': k.boja, 'neradniDani': [], 'ukupnoDana': 0, neradniDani: []});
        id++;
      });

      kuvarice.forEach(function(k, i) {
        k.id = id;
        k.neradniDani = [];
        k.ukupnoDana = 0;
        model.radnici.kuvarice.push(k);

        id++;
      });

      model.mesec.momentModel = moment(model.mesec.ime, 'MMMM-YYYY').locale('sr');
      var daniUmesecu = getDaysArrayByDate(model.mesec.momentModel);

      daniUmesecu.forEach(function(dan) {
        model.mesec.dani.push({
          'ime': dan,
          'nedelja': dan.includes('Ned') || dan.includes('ned.'),
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

    function initMeseci() {
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

      $scope.availableMonths = []

      allMonths.forEach(function(month){
        $scope.availableMonths.push(moment(month).format('MMMM-YYYY'));
      });

      $scope.selectedMesec = $scope.availableMonths[0];
    }

    var emptyModel = {
      'mesec': {
        'dani': [],
        'ime': '',
        'momentModel': ''
      },
      'radnici': {
        'kuvarice': [],
        'konobari': []
      }
    }

    function resetAll() {
      $scope.selectedRadnik = null;
      $scope.resetNeradniDani();
    }

    $scope.removePrintDays = function(lastIndex) {
      if(!$scope.model) {
        return;
      }

      for (var i = 0; i < $scope.model.mesec.dani.length; i++) {
        $scope.model.mesec.dani[i].hidePrint = false;
      }
      $scope.printDaysSet = false;
    };

    function transformModel(model) {
      model.radnici.kuvarice.forEach(function(r) {
        if(r.hasOwnProperty('cistac'))
          delete r.cistac;
        if(r.hasOwnProperty('selected'))
          delete r.selected;
        if(r.hasOwnProperty('edit'))
          delete r.edit;
        if(r.hasOwnProperty('vremeDolaska'))
          delete r.vremeDolaska;
      });

      model.radnici.konobari.forEach(function(r) {
        if(r.hasOwnProperty('cistac'))
          delete r.cistac;
        if(r.hasOwnProperty('selected'))
          delete r.selected;
        if(r.hasOwnProperty('edit'))
          delete r.edit;
        if(r.hasOwnProperty('vremeDolaska'))
          delete r.vremeDolaska;
      });

      console.log('Model transformed: ', model);
      return model;
    }

    function getModelCall(month) {
      $http.get("http://localhost:5000/model", {'params': {'month': month}})
        .then(function (response) {
            console.log('getModel receive response', response);
            resetAll();
            $scope.formDirty = false;

            if(Object.entries(response.data).length === 0 && response.data.constructor === Object) {
              console.log('Model empty, need to initialize');
              $scope.model = angular.copy(emptyModel)
              $scope.model.mesec.ime = month;
              napraviModel($scope.model);
            } else {
              console.log('Received model from server');

              response.data.model.mesec.momentModel = moment(response.data.model.mesec.momentModel);

              // $scope.model = transformModel(response.data.model);
              $scope.model = response.data.model;
            }

            return response;
        }, function (response) {
            return response;
        });
    }

    $scope.getModel = function(month){
      console.log('getModel: ' + month);

      if($scope.formDirty) {
        $scope.sacuvajModel();

        $timeout(function() {
          getModelCall(month);
        }, 500);
        return;
      }

      $scope.removePrintDays();

      getModelCall(month);
    }

    initMeseci();
    $scope.getModel($scope.selectedMesec);

    function prepareModelForSave(model) {
      var modelCopy = angular.copy(model);

      // Remove print days
      for (var i = 0; i < modelCopy.mesec.dani.length; i++) {
        modelCopy.mesec.dani[i].hidePrint = false;
      }

      return modelCopy;
    }

    $scope.sacuvajModel = function() {
      if(!$scope.formDirty) {
        return;
      }
      var preparedModel = prepareModelForSave($scope.model);

      console.log("Saving model, prepared: ", preparedModel);

      $http.post("http://localhost:5000/model", {'model': preparedModel}, {headers: {'Content-Type': 'application/json'} })
        .then(function (response) {
            $scope.savedModel = true;
            $scope.formDirty = false;

            $timeout(function() {
              $scope.savedModel = false;
            }, 2000);

            $scope.saveError = false;

            return response;
        }, function (response) {
            $scope.saveError = true;
            return response;
        });
    };


    if($scope.PRODUCTION) {
      $interval(function() {
        $scope.sacuvajModel();
      }, AUTO_SAVE_INTERVAL);

      window.onbeforeunload = function (event) {
        var message = 'Sure you want to leave?';
        if (typeof event == 'undefined') {
          event = window.event;
        }
        if (event) {
          event.returnValue = message;
        }
        return message;
      }
    }

    $scope.formatMonth = function(date) {
      return date.format('MMMM YYYY');
    };

    $scope.smenaDrop = function(radnikID, smena, isDayDisabled) {
      if(isDayDisabled) {
        resetAll();
        return false;
      }

      var radnik = angular.copy(nadjiRadnikaPoID(radnikID));

      var isContained = false;

      smena.forEach(function(r) {
        if(r.id === radnik.id)
          isContained = true;
      });

      if(!isContained && !smena.disabled) {
        smena.push(radnik);
        $scope.resetNeradniDani();
        $scope.formDirty = true;
        return true;
      }

      $scope.resetNeradniDani();
      return false;
    };

    $scope.formDirty = false;

    $scope.dodajUSmenu = function(rad, smena, acceptedType) {

      if(!rad) {
        console.log("Radnik empty");
        return;
      }

      if(rad.type !== acceptedType)
        return;

      // Mora zbog apdejta neradnih dana, ukoliko su u medjuvremenu promenjeni
      var radnik = angular.copy(nadjiRadnikaPoID(rad.id));

      var contains = false;
      smena.forEach(function(r){
        if(r.id === radnik.id)
          contains = true;
      });

      if(!contains) {
        smena.push(radnik);
        $scope.uvecajDane(radnik.id);
        $scope.formDirty = true;
      }
    };

    $scope.neradniDani = [];

    $scope.disableNeradniDani = function(radnik) {

      if(radnik === null || !radnik.neradniDani)
        return;

      radnik.neradniDani.forEach(function(dan) {
        var smeneArray = [];

        if(radnik.type === 'kuvarica') {
          $scope.model.mesec.dani[moment(dan.moment).date()-1].radnici.kuvarice.disabledType = dan.dayType;
          $scope.neradniDani.push($scope.model.mesec.dani[moment(dan.moment).date()-1].radnici.kuvarice);
        } else if(radnik.type === 'konobar') {
          $scope.model.mesec.dani[moment(dan.moment).date()-1].radnici.konobari.disabledType = dan.dayType;
          $scope.neradniDani.push($scope.model.mesec.dani[moment(dan.moment).date()-1].radnici.konobari);
        }
      });
    };

    $scope.resetNeradniDani = function() {
      $scope.neradniDani.forEach(function(d) {
        d.disabledType = null;
      });
      $scope.neradniDani = [];
    };

    $scope.radnikDragStart = function(radnik) {
      resetAll();
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

    function nadjiRadnikaPoID(id) {
      var res = null;

      $scope.model.radnici.konobari.forEach(function(r){
        if(r.id === id)
          res = r;
      });

      if(!res) {
        $scope.model.radnici.kuvarice.forEach(function(r){
          if(r.id === id)
            res = r;
        });
      }

      return res;
    }

    $scope.izbrisiIzRasporeda = function(id) {
      $scope.formDirty = true;

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

    $scope.popuniModel = function() {
      $scope.model.mesec.dani.forEach(function(d) {
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

    $scope.markForPrint = function(lastIndex) {
      for (var i = 0; i < $scope.model.mesec.dani.length; i++) {
        $scope.model.mesec.dani[i].hidePrint = i > lastIndex;
      }
      $scope.printDaysSet = true;
    };

    $scope.printToCart = function(printSectionId) {

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
                  $scope.model.mesec.momentModel.format('MMMM YYYY') +
                '</h4>' +
                tableContents +
              '</div>' +
              (!$scope.printDaysSet ? (
              '<div class="col-lg-6" style="padding-left: 3px;">' +
                radniciList[0].outerHTML +
              '</div>' +
              '<div class="col-lg-6">' +
                radniciList[1].outerHTML +
              '</div>')
              : '') +
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
