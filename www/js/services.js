angular.module('app.services', [])

  .factory('BlankFactory', [function () {

  }])
  .factory('PostLogin', function ($resource) {
    return $resource('http://localhost:3000/login');
  })
  .factory('PostSubscribe', function ($resource) {
    return $resource('http://localhost:3000/subscribe');
  })
  .factory('PostUnSubscribe', function ($resource) {
    return $resource('http://localhost:3000/unsubscribe');
  })
  .factory('PostSignUp', function ($resource) {
    return $resource('http://localhost:3000/signup');
  })
  .factory('PostUpdateSeries', function ($resource) {
    return $resource('http://localhost:3000/updateseries');
  })
  .factory('sessionStorage', ['$localStorage', '$timeout', '$rootScope', '$location',
    function ($localStorage, $timeout, $rootScope, $location) {
      return {
        addSession: function (id, name) {
          alert('hi');
          $localStorage.id = id;
          $localStorage.name = name;
        },
        removeSession: function () {
          delete $localStorage.name;
          delete $localStorage.id;
          delete $localStorage.series;
        },
        isSession: function () {
          if ($localStorage.id != undefined) {
            return true;
          } else {
            return false;
          }
        },
        authRedirect: function (path) {
          if (!this.isSession()) {
            this.redirect(path);
          }
        },
        redirect: function (path) {
          $timeout(function () {
            $rootScope.$apply(function () {
              $location.path(path);
              console.log($location.path());
            });
          });
        }
      };
    }])
  .factory('errorAlerts', function ($ionicPopup) {
    return {
      showAlert: function (message) {
        var alertPopup = $ionicPopup.alert({
          title: 'ERROR',
          template: message
        });
      }
    };
  })
  .factory('postDataToServer', ['sessionStorage', 'errorAlerts', '$localStorage', function (sessionStorage, errorAlerts, $localStorage) {
    return {
      post: function (postObject, $timeout, $rootScope, $location) {
        if (postObject.message) {
          errorAlerts.showAlert(postObject.message[0]);
        } else {
          sessionStorage.addSession(postObject.id, postObject.username);
          console.log(postObject);
          if (postObject.series != undefined) {
            var seriesData = JSON.stringify(postObject.series);
            $localStorage.series = seriesData;
          }
          sessionStorage.redirect("page2/series");
        }
      }
    }
  }])
  .factory('seriesService', ['$localStorage', 'PostUpdateSeries', function ($localStorage, PostUpdateSeries) {
    return {
      getSeriesFromSession: function () {
        if ($localStorage.series == undefined) {
          var series = [];
        } else {
          var series = JSON.parse($localStorage.series);
        }
        return series;
      },
      setSeriesToSession: function (series) {
        var seriesData = JSON.stringify(series);
        $localStorage.series = seriesData;
      },
      updateSeries: function (showId) {

        function getSeriesIndex(showId, series) {
          for (var i = 0; i < series.length; i++) {
            if (series[i].showId == showId) {
              return i;
            }
          }
        }

        var dataToSend = {};
        var series = this.getSeriesFromSession();
        var seriesIndex = getSeriesIndex(showId, series);
        dataToSend = series[seriesIndex];
        var post = new PostUpdateSeries(dataToSend);
        post.$save(function (postObject) {
          console.log(postObject);
          postDataToServer.post(postObject, $timeout, $rootScope, $location);
        });
      },
    checkIfSubscribed: function (showId) {
      var series = this.getSeriesFromSession();
      for (var i = 0; i < series.length; i++) {
        if (series[i].showId == showId)
          return true;
      }
      return false;
    }

    }

  }
  ])
  .service('BlankService', [function () {

  }]);

