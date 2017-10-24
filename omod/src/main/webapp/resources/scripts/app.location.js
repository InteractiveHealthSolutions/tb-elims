var locationApp = angular.module('app.location',['location.filter', 'locationService']);

locationApp.controller('LocationController', ['$scope','$uibModal','$filter', 'LocationService', 
                function($scope, $uibModal, $filter, LocationService) {
	$scope.locationList = [];
	
	$scope.loadTree = function(forceReload) {
		if($scope.locationList.length > 0 && forceReload === false){
			return;
		}
		
		loc = LocationService.getLocationTree().then(function (response) {
			console.debug('locations fetched');
			if(response){
				$scope.locationList = response;
				
				$scope.divisions = LocationService.getLocationsByTag('divisions');
				$scope.districts = LocationService.getLocationsByTag('districts');
				$scope.upazillas = LocationService.getLocationsByTag('upazillas');
				$scope.unions = LocationService.getLocationsByTag('unions');
			}
		  });
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
	
}]);
