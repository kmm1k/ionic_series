angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


    .state('tabsController', {
      url: '/page2',
      abstract:true,
      templateUrl: 'templates/tabsController.html'
    })




    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'signupCtrl'
    })





    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    })





    .state('tabsController.tVSeries', {
      url: '/series',
      views: {
        'tab1': {
          templateUrl: 'templates/tVSeries.html',
          controller: 'tVSeriesCtrl'
        }
      }
    })





    .state('tabsController.myTVSeries', {
      url: '/myseries',
      views: {
        'tab2': {
          templateUrl: 'templates/myTVSeries.html',
          controller: 'myTVSeriesCtrl'
        }
      }
    })





    .state('singlePage', {
      url: '/single/:id',
      templateUrl: 'templates/singlePage.html',
      controller: 'singlePageCtrl'
    })





    .state('singleSubscribed', {
      url: '/subscribed/:id',
      templateUrl: 'templates/singleSubscribed.html',
      controller: 'singleSubscribedCtrl'
    })


    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
