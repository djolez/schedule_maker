'use strict';

/**
 * @ngdoc overview
 * @name scheduleMakerApp
 * @description
 * # scheduleMakerApp
 *
 * Main module of the application.
 */
angular
  .module('scheduleMakerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'dndLists',
    'ui',
    'multipleDatePicker',
    'sticky',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
