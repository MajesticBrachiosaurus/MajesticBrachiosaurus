angular.module('clever.choices', [])

.controller('PreferenceController', function($scope, Preference, $routeParams, $mdToast){
  $scope.preference = {
    'term': ''
  };

  $scope.searchresults = [];
  $scope.choices = [];
  $scope.voted = false;

  $scope.getEventDetails = function () {
    Preference.getEventDetails(function (data) {
      var time = data.time.split(":");
      $scope.eventId = data.event_id;
      $scope.eventName = data.event_name;
      $scope.location = data.location;
      $scope.date = data.date;
      $scope.time = time[0] + ':' + time[1] + " " + time[2].substr(-2);
    });
  };

  $scope.sendPreference= function () {
    Preference.sendPreference($scope.preference)
    .then(function (res,err) {
      $scope.searchresults = [];
      // Build array of search results from Yelp
      for (var i = 0; i < res.data.length; i++) {
        if (res.data[i].image_url === undefined) {
          res.data[i].image_url = Preference.getDefaultImage();
        }
        // Change image url for higher res image
        // Size reference: http://stackoverflow.com/questions/17965691/yelp-api-ios-getting-a-larger-image
        res.data[i].image_url = res.data[i].image_url.substr(0, res.data[i].image_url.length - 6) + "ls.jpg";
        $scope.searchresults.push(res.data[i]);
      }
    });
  };

  $scope.removeChoice = function(choice) {
    $scope.choiceToRemove = $scope.choices.indexOf(choice);
    $scope.choices.splice($scope.choiceToRemove,1);
    //Preference.removeChoice(choice.id);
  };

  $scope.getChoices = function () {
    Preference.getChoices()
    .then(function (res, err) {
      $scope.choices = [];
      for (var i = 0; i < res.data.length; i++) {
        // Change image url for higher res image
        // Size reference: http://stackoverflow.com/questions/17965691/yelp-api-ios-getting-a-larger-image
        res.data[i].image_url = res.data[i].image_url.substr(0, res.data[i].image_url.length - 6) + "ls.jpg";
        $scope.choices.push(res.data[i]);
      }
      // Sort saved choices by number of votes
      $scope.choices.sort(function (a,b) {
        return b.votes - a.votes;
      });
    });
  };

  $scope.storeChoice = function (choice) {
    if (Preference.notInChoices(choice, $scope.choices)) {
      Preference.storeChoice(choice.id)
      .then(function success (response) {
        $scope.choices.push(choice);
        $mdToast.showSimple('Saved');
        }, function error (response) {
          if (response.status === 418) {
            $mdToast.showSimple('Limit reached');
          }
      });
    } else {
      $mdToast.showSimple('Already saved');
    }
    return true;
  };

  $scope.updateVotes = function(choice) {
    Preference.updateVotes(choice)
    .then(function(resp) {
      $scope.choices.forEach(function(choice) {
        if(choice.id === resp.data.business_id) {
          choice.votes = resp.data.votes;
        }
      });

    });
  };

  // Populate rvent details and saved choices on load
  $scope.getEventDetails();
  $scope.getChoices();
})

.factory('Preference', function ($http, $routeParams) {
  //send request to yelp api
  var defaultImagePath = '../../assets/default_business.jpg';

  var sendPreference = function (term) {
    return $http({
      method: 'Get',
      url:'/' + $routeParams.event_id + '/search',
      params: term
    });
  };

  var getChoices = function () {
    var choicesArray = [];
    return $http({
      method: 'Get',
      url:'/' + $routeParams.event_id + '/saved',
    });
  };

  var storeChoice = function (business_id, index) {
    return $http({
      method: 'Post',
      url: '/' + $routeParams.event_id + '/store',
      data: {
        id: business_id
      }
    });
  };

  var removeChoice = function (business_id) {
    return $http({
      method: 'Post',
      url: '/' + $routeParams.event_id + '/remove',
      data: {
        id: business_id
      }
    });
  };

  var getEventDetails = function (cb) {
    $http({
      method: 'POST',
      url: '/' + $routeParams.event_id + '/details',
      data: $routeParams
    })
    .then(function (res) {
      console.log(res.data);
      cb(res.data);
    });
  };

  var updateVotes = function(choice) {
    return $http({
      method: 'POST',
      url: '/' + $routeParams.event_id + '/votes',
      data: choice
    });
  };

  var notInChoices = function (newChoice, choices) {
    for (var i = 0; i < choices.length; i++) {
      if (choices[i].id === newChoice.id) {
        return false;
      }
    }
    return true;
  };

  var getDefaultImage = function () {
    return defaultImagePath;
  };

  return {
    sendPreference:sendPreference,
    getChoices:getChoices,
    storeChoice:storeChoice,
    getEventDetails:getEventDetails,
    removeChoice: removeChoice,
    notInChoices: notInChoices,
    getDefaultImage: getDefaultImage,
    updateVotes: updateVotes
  };
});
