angular.module('clever.choices', [])

.controller('PreferenceController', function($scope, Preference,$routeParams){
  //TODO send and receive preferences on same page how to receive and send/receive
  $scope.preference={
    'term': ''
  };

  $scope.getEventDetails = function(){
    console.log('rof');
    Preference.getEventDetails(function(data) {
      console.log(data);
      $scope.eventName = data.event_name;
      $scope.location = data.location;
    });
  };

  $scope.searchresults = [];
  $scope.choices = [];

  $scope.sendPreference= function(){
    $scope.searchresults = [];
    Preference.sendPreference($scope.preference, $scope.searchresults);
  };

  $scope.getChoices=function(){
    Preference.getChoices()
    .then( function (data, err) {
      $scope.choices = [];
      for(var i = 0; i < data.data.length; i++){
        $scope.choices.push(data.data[i]);
      }
    });
  };

  $scope.getEventDetails();

  $scope.storeChoice = Preference.storeChoice;
  //receive choices
  $scope.getChoices();
})

.factory('Preference', function($http, $routeParams){
  //send request to yelp api
  var defaultImagePath = '../../assets/default_business.jpg';

  var sendPreference=function(term, resultsArray){
    return $http({
      method: 'Get',
      url:'/' + $routeParams.event_id + '/search',
      params: term
    }).then(function(data,err){
      for(var i = 0; i < data.data.length; i++){
        console.log(data.data[i].image_url);
        if(data.data[i].image_url === undefined){
          data.data[i].image_url = defaultImagePath;
        }
        resultsArray.push(data.data[i]);
      }
    });
  };

  var getChoices=function(choicesArray){
    return $http({
      method: 'Get',
      url:'/' + $routeParams.event_id + '/saved',
    });
  };

  var storeChoice = function (business_id) {
    console.log('storing', business_id);
    $http({
      method: 'Post',
      url: '/' + $routeParams.event_id + '/store',
      data: {
        id: business_id
      }
    }).then(function(data,err){
      if(err){
        console.error(err);
      }
    });
  };

  var getEventDetails = function(cb){
    console.log($routeParams);
    $http({
      method: 'POST',
      url: '/' + $routeParams.event_id + '/details',
      data: $routeParams
    })
    .then(function(res){
      console.log(res.data);
      cb(res.data);
    });
  };

  return {
    sendPreference:sendPreference,
    getChoices:getChoices,
    storeChoice:storeChoice,
    getEventDetails:getEventDetails
  };
});
