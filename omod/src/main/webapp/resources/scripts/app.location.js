var locationApp = angular.module('app.location',[]);

locationApp.controller('LocationController', ['$scope','$http','$uibModal', function($scope, $http, $uibModal) {
	$scope.locationList = [];
	
	$scope.loadTree = function(forceReload) {
		if($scope.locationList.length > 0 && forceReload === false){
			return;
		}
		
		$http({
		  method: 'GET',
		  url: '/openmrs/data/rest/tbelims/location/tree.json'
		})
		.then(function successCallback(response) {
			console.debug('locations fetched');
			///console.debug(response.data.data);
			if(response.data.data){
				$scope.locationList = JSON.parse(response.data.data);
				$scope.initTaggedLocations(['division','district','upazilla','union']);
			}
		  }, 
		  function errorCallback(response) {
			  console.debug('locations error');
			  console.debug(response);
		  });
	};
	
	$scope.initTaggedLocations = function(tags) {
		for (var i = 0; i < tags.length; i++) {
			var tag = tags[i];
			$scope[tag+'s'] = $scope.locationByTagFilter($scope.locationList,tag,true);
		}
	};
	
	$scope.openTreeModal = function() {
		treeList = $scope.locationList;
		
		modalInstance = $uibModal.open({
			ariaLabelledBy: 'modal-title-top',
			ariaDescribedBy: 'modal-body-top',
			templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/location-tree.html',
			controller: function($scope, param) {
		    	console.debug('param');
		    	console.debug(param);
			    $scope.locationList = param;
			    $scope.ok = function() {
			            
			    };
		        $scope.cancel = function() {
		           
		        };
		      },
		      resolve: {
		    	  param: function () {
                      return treeList;
                  }
              }
          });

		    modalInstance.result.then(function (item) {
		      console.debug(item);
		    }, function () {
		    	console.info('Modal dismissed at: ' + new Date());
		    });
	};
	
	$scope.locationByTagFilter = function(locationList, tag, hierarchicalTagging) {
		if(!locationList.length){
			return [];
		}
		
		var resultLocations = fillLocations(tag, hierarchicalTagging, locationList, resultLocations);

		console.debug('filtered locations');
		console.debug(resultLocations);
		
		return resultLocations;
	};
	
}]);

fillLocations = function(tag, hierarchicalTagging, searchableLocations, resultLocations) {
	if(!resultLocations){
		resultLocations = [];
	}
	
	for (var i = 0; i < searchableLocations.length; i++) {
		var loc = searchableLocations[i];
		
		var matched = false;
		if(loc.tags){
			for (var k = 0; k < loc.tags.length; k++) {
				var locTag = loc.tags[k];
				if(locTag.name.toLowerCase().indexOf(tag.toLowerCase()) !== -1){
					resultLocations.push(loc);
					matched = true;
					break;
				}
			}
		}
		
		//if tagging is hierarchical then stop digging children when location of given tag is found
		if(!(hierarchicalTagging && matched) && loc.children && loc.children.length > 0){
			fillLocations(tag, hierarchicalTagging, loc.children, resultLocations);
		}
	}

	return resultLocations;
};
