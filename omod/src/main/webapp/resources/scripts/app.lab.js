var labApp = angular.module('app.lab',['location.filter','app.location','labService','locationService','ui.grid','ui.grid.pagination'
                                              ,'ui.grid.autoResize', 'ui.tree']);

// set parentLocation to union automatically before saving
labApp.controller('LabListController', ['$scope', '$filter', '$state', 'uiGridConstants', 'LabService',
    function($scope, $filter, $state, uiGridConstants, LabService) {
	
	$scope.searchFilter = {};
	
	var paginationOptions = {
	    pageNumber:1,
	    pageSize: 20,
	};
	
	// Initializing data grid default options
	$scope.labsList = {
        enableSorting: false,
        enableColumnMenus: false,
        rowHeight:35,
        paginationPageSizes: [5, 20, 40, 60],
        paginationPageSize: paginationOptions.pageSize,
        useExternalPagination: true, 
        columnDefs: [
          { name:'Lab ID', width: '10%', field: 'identifier' },
          { name:'Name', width: '15%', field: 'name' },
          { name:'Lab Type', width: '15%', field: 'labType'},
          { name:'Organization Type', width: '10%', field: 'organizationType'},
          { name:'District', width: '15%', field: 'countyDistrict'},
          { name:'Upazilla', width: '15%', field: 'cityVillage'},
          { name:'Profile', width: '10%', field: 'uuid', cellTemplate: 'view-profile-button.html'},
          { name:'Edit', width: '10%', field: 'uuid', cellTemplate: 'edit-profile-button.html'}
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
	
	$scope.openProfile = function(currentLab) {
		console.debug(currentLab);
		$state.go('lab-profile', {lab: currentLab});
	}
	
	$scope.editProfile = function(currentLab) {
		console.debug(currentLab);
		$state.go('lab-edit', {lab: currentLab});
	}
	
	$scope.loadLabs = function() {
		console.debug('fetching data using searchFilter');
		console.debug($scope.searchFilter);
		
		var sf = $scope.searchFilter;
		sf.limit = paginationOptions.pageSize;
		sf.start = (paginationOptions.pageNumber-1)*sf.limit;
		
		var searchFilterProvided = false;
		
		for ( var key in sf) {
			if (sf.hasOwnProperty(key) && sf[key]) {
				searchFilterProvided = true;
			}
		}
		
		if(!searchFilterProvided){
			alert('Atleast one search filter must be specified');
			return;
		}
		
		LabService.getLabs(sf)
			.then(function(response) {
					console.debug('labs');
					console.debug(response);
					if (response) {
						$scope.labsList.data = response.results;
						$scope.labsList.totalItems = response.totalCount;
					}
				},
				function(response) {
					//TODO handle this error and show to user
					console.debug('labs error');
					console.log(response);
				});
	};

	$scope.doLabRegistration = function() {
		$state.go('lab-registration');
	}
	
	$scope.attributeValue = function(attributeList, attribute) {
		return $filter("attributeValue")(attributeList, attribute);
	};
	
}]);

labApp.controller('LabRegistrationController', ['$scope', '$rootScope', '$filter', '$state', 'LabService', 'LocationService',
                       function($scope, $rootScope, $filter, $state, LabService, LocationService) {
	
	$scope.location = {};
	$scope.stateProvinceId = '';
	$scope.countyDistrictId = '';
	$scope.cityVillageId = '';
	$scope.address3Id = '';
	
	$scope.updateIds = function() {
		console.log("updateIds");
		
		divisions = LocationService.getLocationsByTag('divisions');
		districts = LocationService.getLocationsByTag('districts');
		upazillas = LocationService.getLocationsByTag('upazillas');
		unions = LocationService.getLocationsByTag('unions');
		
		$scope.stateProvinceId = LocationService.getLocationAttribute(divisions, $scope.location.stateProvince, 'Identifier');
		$scope.countyDistrictId = LocationService.getLocationAttribute(districts, $scope.location.countyDistrict, 'Identifier');
		$scope.cityVillageId = LocationService.getLocationAttribute(upazillas, $scope.location.cityVillage, 'Identifier');
		$scope.address3Id = LocationService.getLocationAttribute(unions, $scope.location.address3, 'Identifier');
		
		$scope.location.identifier = $scope.stateProvinceId + $scope.countyDistrictId + $scope.cityVillageId + $scope.address3Id +'-xxx';
	};
	
	$scope.submitForm = function() {
		console.log('Submitting new Lab');
		
		// set parent location = union/address3
		$scope.location.parentLocation = $scope.location.address3;
		
		LabService.saveLab($scope.location).then(function(res) {
				console.debug('Lab Submission result');
				console.debug(res);
				if(res.uuid){
					LabService.getLab(res.uuid).then(function(res) {
						console.debug('lab');
						console.debug(res);
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
				alert('Error saving lab. Make sure that Lab name is unique and all required properties are specified');
			});
	};
	$scope.cancelRegistration = function() {
		if (confirm($rootScope.msgs['tbelims.lab-registration.label.cancel'])) {
			$state.go('lab-list');
		}
	}
}]);
labApp.controller('LabProfileController', ['$scope', '$filter', '$state', 'LabService', 
                       function($scope, $filter, $state, LabService) {
	if(!$state.params.lab){
		$state.go('lab-list');
	}
	
	$scope.dataMap = {
		location : $state.params.lab
	};
	
	$scope.editProfile = function(currentLab) {
		console.debug(currentLab);
		$state.go('lab-edit', {lab: currentLab});
	}
	
	$scope.voidRegistration = function(currentLab) {
		if(!$scope.voidReason){
			alert('Void reason must be specified');
			return;
		}
		LabService.voidLab(currentLab.uuid, $scope.voidReason).then(function(res) {
			console.debug('Lab voided');
			$state.go('lab-list');
		},
		function(response) {
			console.debug('lab void error');
			console.log(response);
			alert('Error voiding lab');
		});
	}
	
}]);
labApp.controller('LabEditController', ['$scope', '$rootScope', '$filter', '$state', 'LabService', 
                       function($scope, $rootScope, $filter, $state, LabService) {
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
		
	$scope.location.registrationDate = castDateField($scope.location.registrationDate);
	
	$scope.submitForm = function() {
		// set parent location = union/address3
		$scope.location.parentLocation = $scope.location.address3;
		
		console.log('Submitting edited Lab');
		console.log($scope.location);

		LabService.editLab($scope.location).then(function(res) {
				console.debug('Lab edited');
				if(res.uuid){
					LabService.getLab(res.uuid).then(function(res) {
						console.debug(res);
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
				alert('Error editing lab. Make sure that Lab name is unique and all required properties are specified');
			});
	};
	$scope.cancelEdit = function() {
		if (confirm($rootScope.msgs['tbelims.lab-edit.label.cancel'])) {
			$state.go('lab-list');
		}
	}
	
}]);
