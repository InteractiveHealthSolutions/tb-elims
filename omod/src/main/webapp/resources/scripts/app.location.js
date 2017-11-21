var locationApp = angular.module('app.location',['location.filter', 'locationService']);

locationApp.controller('LocationController', ['$scope','$uibModal','$filter', 'LocationService', 
                function($scope, $uibModal, $filter, LocationService) {
	
	$scope.loadLocations = function(forceReload, tags) {
		for (var i = 0; i < tags.length; i++) {
			var tg = tags[i];
			// fetch all locations by tag and set local=false if forceReload=true. nolimit=true so that all locations are loaded
			LocationService.getLocationsByTag(tg, !forceReload, true).then(function (response) {});
		}
	};
	$scope.loadScopeLocations = function(tag, key) {
		LocationService.loadLocationsByTag(tag, $scope, key);
	};
	$scope.fetchScopeLocations = function(tag, key, parent, flag) {
		if(flag){
			$scope[flag] = true;
		}

		params = {parent: parent};
		if(tag){
			params['tags'] = tag;
		}
		LocationService.getLocations(params, true).then(function(response) {
			$scope[key] = response;

			if(flag){
				$scope[flag] = false;
			}
		});
	};
	/*$scope.openTreeModal = function() {
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
	};*/
	
}]);
