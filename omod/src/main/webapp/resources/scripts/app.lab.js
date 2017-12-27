var labApp = angular.module('app.lab',['location.filter','app.location','locationService',
             'ui.grid','ui.grid.pagination','ui.grid.autoResize', 'ui.tree']);

labApp.controller('LabController', ['$scope', '$filter', '$state', 'uiGridConstants', 'LocationService',
       function($scope, $filter, $state, uiGridConstants, LocationService) {

    LocationService.loadLocationsByTag('division', $scope, 'divisions');
	LocationService.loadLocationsByTag('district', $scope, 'districts');
	LocationService.loadLocationsByTag('upazilla', $scope, 'upazillas');
	
	$scope.today = new Date();
	$scope.previousYearDate = new Date();
	$scope.previousYearDate.setFullYear($scope.today.getFullYear() - 1);
	
    var $translate = $filter('translate');
	
	$scope.openProfile = function(current) {
		$state.go('lab-profile', {lab: current});
	}
	
	$scope.editProfile = function(current) {
		$state.go('lab-edit', {lab: current});
	}

	$scope.registerProfile = function() {
		$state.go('lab-registration');
	}
	
	$scope.cancelRegistration = function() {
		if (confirm($translate('tbelims.lab-registration.label.cancel'))) {
			$state.go('lab-list');
		}
	}
	
	$scope.cancelEdit = function() {
		if (confirm($translate('tbelims.lab-edit.label.cancel'))) {
			$state.go('lab-list');
		}
	}
	
	$scope.voidProfile = function(current) {
		if(!$scope.voidReason){
			alert($translate('tbelims.lab-void.reason.missing.warning'));
			return;
		}
		LocationService.voidLab(current.uuid, $scope.voidReason).then(function(res) {
			console.debug('Lab voided');
			LocationService.getLab(res.uuid).then(function(res) {
				$state.go('lab-profile', {lab: res});
			});
		},
		function(response) {
			console.debug('lab void error');
			console.log(response);
			alert('Error voiding lab '+response.data.error.message);
		});
	}
}]);

// set parentLocation to union automatically before saving
labApp.controller('LabListController', ['$scope', '$filter', '$state', 'uiGridConstants', 'LocationService',
              function($scope, $filter, $state, uiGridConstants, LocationService) {
	
	$scope.searchFilter = {};
	
	var paginationOptions = {
	    pageNumber:1, pageSize: 20,
	};
	
	$scope.labsList = {
        enableSorting: false,
        enableColumnMenus: false,
        rowHeight:35,
        paginationPageSizes: [5, 20, 40, 60],
        paginationPageSize: paginationOptions.pageSize,
        useExternalPagination: true, 
        columnDefs: [
          { name:'Lab ID', width: '10%', field: 'identifier' },
          { name:'Name', width: '20%', field: 'name' },
          { name:'Lab Type', width: '12%', field: 'labType'},
          { name:'Org. Type', width: '10%', field: 'organizationType'},
          { name:'District', width: '16%', field: 'countyDistrict'},
          { name:'Upazilla', width: '20%', field: 'cityVillage'},
          { name:'Profile', width: '7%', field: 'uuid', cellTemplate: 'view-profile-button.html'},
          { name:'Edit', width: '7%', field: 'uuid', cellTemplate: 'edit-profile-button.html'}
          ],
        data: [],
        onRegisterApi: function (gridApi) {      
        	// make grid adapt to height according to page size or resultset
            gridApi.core.on.rowsRendered(null, function(gridApi) {
            	resetGridHeight($scope.labsList, $scope);
			});
            
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            	paginationOptions.pageNumber = newPage;
                paginationOptions.pageSize = pageSize;
                
                $scope.loadLabs();
            });
            
            $scope.loadLabs();
        }
	};
	
	$scope.loadLabs = function() {
		console.debug($scope.searchFilter);
		
		var sf = $scope.searchFilter;
		sf.limit = paginationOptions.pageSize;
		sf.start = (paginationOptions.pageNumber-1)*sf.limit;
		
		LocationService.getLabs(sf).then(function(response) {
			console.debug('labs');
			console.debug(response);
			if (response) {
				$scope.labsList.data = response.results;
				$scope.labsList.totalItems = response.totalCount;
			}
		}, function(response) {
			//TODO handle this error and show to user
			console.debug('labs error');
			console.error(response);
		});
	};
}]);

labApp.controller('LabRegistrationController', ['$scope', '$rootScope', '$filter', '$state', 'LocationService',
       function($scope, $rootScope, $filter, $state, LocationService) {
	
	$scope.location = {};
	$scope.stateProvinceId = '';
	$scope.countyDistrictId = '';
	$scope.cityVillageId = '';
	$scope.address3Id = '';
	$scope.loadingData = false;

	$scope.updateId = function(locations, location, modelVariable) {
		$scope[modelVariable] = LocationService.getLocationAttribute(locations, location, 'Identifier');
		
		$scope.location.identifier = $scope.stateProvinceId + $scope.countyDistrictId + $scope.cityVillageId + $scope.address3Id +'-xxx';
	};
	
	$scope.submitForm = function() {
		// set parent location = union/address3
		$scope.location.parentLocation = $scope.location.address3;
		
		LocationService.saveLab($scope.location).then(function(res) {
				console.debug(res);
				if(res.uuid){
					LocationService.getLab(res.uuid).then(function(res) {
						$state.go('lab-profile', {lab: res});
					});
				}
				else {
					alert('No uuid found in response. Contact program vendor');
				}
			},
			function(response) {
				console.debug('lab submission error');
				console.log(response);
				alert('Error saving lab. Make sure that Lab name is unique and all required properties are specified '+response.data.error.message);
			});
	};

}]);
labApp.controller('LabProfileController', ['$scope', '$filter', '$state', 'LocationService', 
       function($scope, $filter, $state, LocationService) {
	if(!$state.params.lab){
		$state.go('lab-list');
	}
	
	$scope.dataMap = {
		location : $state.params.lab
	};
}]);
labApp.controller('LabEditController', ['$scope', '$rootScope', '$filter', '$state', 'LocationService',
       function($scope, $rootScope, $filter, $state, LocationService) {
	if(!$state.params.lab){
		$state.go('lab-list');
	}
	
	// copy fields to be updated. no extra fields should be sent as extra data throws exception for resource operation not supported
	var fields = ['uuid', 'registrationDate', 'labType', 'name', 'stateProvince', 'countyDistrict', 'cityVillage', 'address3', 
	              'organizationType', 'organizationName', 'identifier'];

	$scope.location = {};
	
	for (var i = 0; i < fields.length; i++) {
		$scope.location[fields[i]] = $state.params.lab[fields[i]];
	}
	
	LocationService.loadChildLocations($state.params.lab.cityVillage, 'union', $scope, 'unions', 'loadingData');

	$scope.location.registrationDate = castDateField($scope.location.registrationDate);
	
	$scope.submitForm = function() {
		// set parent location = union/address3
		$scope.location.parentLocation = $scope.location.address3;
		
		console.debug($scope.location);

		LocationService.editLab($scope.location).then(function(res) {
			console.debug('Lab edited');
			console.debug(res);
			if(res.uuid){
				LocationService.getLab(res.uuid).then(function(res) {
					$state.go('lab-profile', {lab: res});
				});
			}
			else {
				alert('No uuid found in response. Contact program vendor');
			}
		},
		function(response) {
			console.debug('lab edit error');
			console.log(response);
			alert('Error editing lab. Make sure that Lab name is unique and all required properties are specified '+response.data.error.message);
		});
	};
}]);
