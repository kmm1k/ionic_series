angular.module('app.controllers', ['ionic', 'ngResource'])

  .controller('signupCtrl', function ($scope, PostSignUp, $ionicPopup, $localStorage, postDataToServer, sessionStorage,
                                      $location, $timeout, $rootScope) {

    // Our form data for creating a new post with ng-model
    $scope.postData = {};
    $scope.signUp = function () {
      var post = new PostSignUp($scope.postData);
      post.$save(function (postObject) {
        postDataToServer.post(postObject, $timeout, $rootScope, $location);
      });
    };

  })

  .controller('loginCtrl', function ($scope, PostLogin, $ionicPopup, $localStorage, postDataToServer,
                                     $location, $timeout, $rootScope) {
    // Our form data for creating a new post with ng-model
    $scope.postData = {};
    $scope.logIn = function () {
      var post = new PostLogin($scope.postData);
      post.$save(function (postObject) {
        postDataToServer.post(postObject, $timeout, $rootScope, $location);
      });
    };


  })


  .controller('tVSeriesCtrl', function ($scope, $rootScope, $location, $timeout, sessionStorage, $http) {
    sessionStorage.authRedirect('login');

    $scope.searchDefault = function () {
      $http({
        method: 'GET',
        url: "http://api.themoviedb.org/3/discover/tv?api_key=20907b42632c8a948bea26d333d3244e&sort_by=popularity.desc",
      }).then(function successCallback(response) {
        console.log(response);
        $scope.tvShows = response.data.results;
      }, function errorCallback(response) {
        console.log(response);
      });
    }

    $scope.searchData = {};
    $scope.searchData.name = "";
    $scope.searchForMovies = function () {
      if ($scope.searchData.name.length <= 1) {
        $scope.searchDefault();
        return;
      }
      $http({
        method: 'GET',
        url: "http://api.themoviedb.org/3/search/tv?api_key=20907b42632c8a948bea26d333d3244e",
        params: {query: $scope.searchData.name}
      }).then(function successCallback(response) {
        $scope.tvShows = response.data.results;
      }, function errorCallback(response) {
        console.log(response);
      });
    };
    $scope.searchDefault();

    $scope.logOut = function () {
      sessionStorage.removeSession();
      sessionStorage.redirect('login')
    }

  })

  .controller('myTVSeriesCtrl', function ($scope, seriesService, sessionStorage) {
    $scope.series = seriesService.getSeriesFromSession();
    $scope.logOut = function () {
      sessionStorage.removeSession();
      sessionStorage.redirect('login')
    }
  })

  .controller('singlePageCtrl', function ($scope, $http, $stateParams, sessionStorage, postDataToServer,
                                          PostSubscribe, $sce, errorAlerts, $localStorage, PostUnSubscribe, seriesService) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
    });
    sessionStorage.authRedirect('login');
    $scope.videoUrl = "";
    $scope.showInfo = {};
    $scope.loaded = false;
    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };
    $scope.hasVideos = function () {
      if ($scope.showInfo.videos != undefined) {
        if ($scope.showInfo.videos.results.length > 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };
    $scope.getInfoAboutSeries = function () {
      $http({
        method: 'GET',
        url: "https://api.themoviedb.org/3/tv/" + $stateParams.id
        + "?api_key=20907b42632c8a948bea26d333d3244e&append_to_response=releases,videos"
      }).then(function successCallback(response) {
        console.log(response);
        $scope.showInfo = response.data;
        if ($scope.hasVideos()) {
          $scope.videoUrl = "https://www.youtube.com/embed/" + response.data.videos.results[0]['key'];
          $scope.movie = {src: $scope.videoUrl, title: "Egghead.io AngularJS Binding"};
        }
        $scope.loaded = true;
      }, function errorCallback(response) {
        console.log(response);
      });
    };
    $scope.getInfoAboutSeries();

    $scope.subscribe = function () {
      var dataToSend = {};
      if ($scope.showInfo.seasons != undefined) {
        dataToSend.seasons = parseSeasons($scope.showInfo.seasons);
        dataToSend.title = $scope.showInfo.name;
        dataToSend.showId = $scope.showInfo.id;
        dataToSend.overview = $scope.showInfo.overview;
        dataToSend.posterPath = $scope.showInfo.poster_path;
        dataToSend.backPath = $scope.showInfo.backdrop_path;
        dataToSend.userId = $localStorage.id;
        $scope.subscribeToSeries(dataToSend);

        var post = new PostSubscribe(dataToSend);
        post.$save(function (postObject) {
          console.log(postObject);
          postDataToServer.post(postObject, $timeout, $rootScope, $location);
        });
      } else {
        errorAlerts.showAlert("could not get show data");
        return;
      }
    };

    $scope.unSubscribe = function (showId) {
      var dataToSend = {};
      if ($scope.showInfo.seasons != undefined) {
        dataToSend.showId = $scope.showInfo.id;
        dataToSend.userId = $localStorage.id;
        $scope.unSubscribeFromSeries(showId);
        var post = new PostUnSubscribe(dataToSend);
        post.$save(function (postObject) {
          console.log(postObject);
          postDataToServer.post(postObject, $timeout, $rootScope, $location);
        });
      }
    }

    $scope.unSubscribeFromSeries = function (showId) {
      var series = seriesService.getSeriesFromSession();
      console.log(series)
      var index = $scope.getSeriesIndex(series, showId);
      if (index == -1) return;
      console.log(index)
      series.splice(index, 1);
      console.log(series)
      seriesService.setSeriesToSession(series);
    }

    $scope.getSeriesIndex = function (series, showId) {
      console.log(showId)
      for (var i = 0; i < series.length; i++) {
        if (series[i].showId == showId) {
          return i;
        }
      }
      return -1;
    }

    $scope.seriesService = seriesService;


    $scope.subscribeToSeries = function (data) {
      var series = seriesService.getSeriesFromSession();
      series.push(data);
      var seriesData = JSON.stringify(series);
      $localStorage.series = seriesData;
    }


    function parseSeasons(input_seasons) {
      var episodes = [];
      var seasons = [];
      for (var i = 1; i < input_seasons.length; i++) {
        episodes = [];
        for (var k = 0; k < input_seasons[i].episode_count; k++) {
          episodes.push({nr: k, watched: false});
        }
        seasons.push(episodes)
      }
      return seasons;
    }

  })

  .controller('singleSubscribedCtrl', function ($scope, seriesService, $stateParams, sessionStorage, $http) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
    });
    var series = seriesService.getSeriesFromSession();
    var showId = $stateParams.id;
    var seriesIndex = getSeriesIndex(showId, series);
    $scope.show = series[seriesIndex];

    function generateSmartInfoAboutSeries() {
      $scope.subscriptionText = "";
      $scope.newestEpisodeText = "";
      if (checkIfLastSeasonIsWatched()) {
        getInfoAboutNewSeason();
      }
      getHowManyEpisodesToWatch();

    }

    function getHowManyEpisodesToWatch() {
      var sumOfEpisodesToWatch = 0;
      var sumOfAllEpisodes = 0;
      var seasons = $scope.show.seasons;
      for (var seasonvar = 0; seasonvar < seasons.length; seasonvar++) {
        for (var episodevar = 0; episodevar < parseInt(seasons[seasonvar].length); episodevar++) {
          if (seasons[seasonvar][episodevar].watched) {
            sumOfEpisodesToWatch++;
          }
          sumOfAllEpisodes++;
        }
      }
      printMessageToScope(sumOfEpisodesToWatch, sumOfAllEpisodes);
    }
    function printMessageToScope(sumOfEpisodesToWatch, sumOfAllEpisodes) {
      $scope.subscriptionText = " you have watched " + sumOfEpisodesToWatch + " out of " + sumOfAllEpisodes +" episodes";
    }

    function getInfoAboutNewSeason() {
      var someSmartInfo = "";
      $http({
        method: 'GET',
        url: "http://api.themoviedb.org/3/tv/" + showId + "?api_key=20907b42632c8a948bea26d333d3244e"
      }).then(function successCallback(response) {
        someSmartInfo = response.data.last_air_date;
        if (someSmartInfo != "") {

          var date = Date.now();
          var mydate = new Date(someSmartInfo);
          if (date < mydate) {
            $scope.newestEpisodeText = " You have watched all the episodes in the last season - \n New episode at: \n" + someSmartInfo;
          }
        }
      }, function errorCallback(response) {
        console.log(response);
      });
    }

    $scope.toggleGroup = function (group) {
      group.show = !group.show;
    };
    $scope.isGroupShown = function (group) {
      return group.show;
    };

    function checkIfLastSeasonIsWatched() {
      var seasons = $scope.show.seasons;
      var lastSeasonIndex = seasons.length - 1;
      if (seasons.length == 0) return false;
      for (var i = 0; i < seasons[lastSeasonIndex].length; i++) {
        if (seasons[lastSeasonIndex][i].watched == false) {
          return false;
        }
      }
      return true;
    }

    generateSmartInfoAboutSeries();


    function getSeriesIndex(showId, series) {
      for (var i = 0; i < series.length; i++) {
        if (series[i].showId == showId) {
          return i;
        }
      }
      sessionStorage.redirect('page2/myseries')
    }

    $scope.seriesService = seriesService;

    $scope.watched = function (showIndex, seasonIndex) {

      console.log($scope.show.seasons[seasonIndex][showIndex].watched)
      if (series[seriesIndex].seasons[seasonIndex][showIndex].watched == true) {
        series[seriesIndex].seasons[seasonIndex][showIndex].watched = false;
        $scope.show.seasons[seasonIndex][showIndex].watched = true;
      } else {
        series[seriesIndex].seasons[seasonIndex][showIndex].watched = true;
        $scope.show.seasons[seasonIndex][showIndex].watched = false;
      }
      seriesService.setSeriesToSession(series);
      seriesService.updateSeries(showId);
      generateSmartInfoAboutSeries();
    }

  })
  .controller('logOutCtrl', function ($scope) {
    $scope.logOut = function () {
      alert("log me out");
    }
  })
