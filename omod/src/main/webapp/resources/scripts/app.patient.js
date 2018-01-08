var patientApp = angular.module('app.patient',['person.filter','app.location','patientService','ui.grid','ui.grid.pagination'
                                              ,'ui.grid.autoResize', 'ui.tree']);

patientApp.controller('PatientController', ['$scope', '$filter', '$state', 'uiGridConstants', 'LocationService',
    function($scope, $filter, $state, uiGridConstants, LocationService) {

	LocationService.loadLocationsByTag('division', $scope, 'divisions');
	LocationService.loadLocationsByTag('district', $scope, 'districts');
	
	$scope.today = new Date();
	$scope.previousYearDate = new Date();
	$scope.previousYearDate.setFullYear($scope.today.getFullYear() - 1);
	
	var $translate = $filter('translate');
	
	$scope.openProfile = function(current) {
		$state.go('patient-profile', {patient: current});
	}
	
	$scope.editProfile = function(current) {
		$state.go('patient-edit', {patient: current});//TODO doesnot exist
	}

	$scope.registerProfile = function() {
		$state.go('patient-registration');//TODO doesnot exist
	}
	
	$scope.cancelRegistration = function() {//TODO doesnot exist
		if (confirm($translate('tbelims.patient-registration.label.cancel'))) {
			$state.go('patient-list');
		}
	}
	
	$scope.cancelEdit = function() {//TODO doesnot exist
		if (confirm($translate('tbelims.patient-edit.label.cancel'))) {
			$state.go('patient-list');
		}
	}
	
	$scope.voidProfile = function(current) {//TODO doesnot exist
		if(!$scope.voidReason){
			alert($translate('tbelims.patient-void.reason.missing.warning'));
			return;
		}
		PatientService.voidPatient(current.uuid, $scope.voidReason).then(function(res) {//TODO doesnot exist
			console.debug('patient voided');
			LocationService.getLab(res.uuid).then(function(res) {
				$state.go('patient-profile', {lab: res});
			});
		},
		function(response) {
			console.debug('patient void error');
			console.log(response);
			alert('Error voiding patient '+response.data.error.message);
		});
	}
}]);

patientApp.controller('PatientListController', ['$scope', '$filter', '$state', 'uiGridConstants', 'PatientService', 'LocationService',
    function($scope, $filter, $state, uiGridConstants, PatientService,LocationService) {

	$scope.searchFilter = {};
	
	var paginationOptions = {
	    pageNumber:1, pageSize: 20,
	};
	
	// Initializing data grid default options
	$scope.patientsList = {
        enableSorting: false,
        enableColumnMenus: false,
        rowHeight:35,
        paginationPageSizes: [5, 20, 40, 60],
        paginationPageSize: paginationOptions.pageSize,
        useExternalPagination: true, 
        columnDefs: [
          { name:'Patient ID', width: '20%', field: uiGridConstants.ENTITY_BINDING, cellFilter: 'getIdentifierValue:"eLIMS Identifier"' },
          { name:'Name', width: '20%', field: 'person.display' },
          { name:'Age', width: '7%', field: 'person.age'},
          { name:'Sex', width: '8%', field: 'person.gender'},
          { name:'Occupation', width: '15%', field: uiGridConstants.ENTITY_BINDING, cellFilter: 'getAttributeValueOf:"person":"Occupation"'},
          { name:'Contact No.', width: '15%', field: uiGridConstants.ENTITY_BINDING, cellFilter: 'getAttributeValueOf:"person":"Primary Contact Number"'},
          { name: 'Profile', width: '15%', field: 'uuid', cellTemplate: 'view-profile-button.html'}
          ],
        data: [],
        onRegisterApi: function (gridApi) {           
        	// make grid adapt to height according to page size or resultset
            gridApi.core.on.rowsRendered(null, function(gridApi) {
            	resetGridHeight($scope.patientsList, $scope);
			});
            
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            	paginationOptions.pageNumber = newPage;
                paginationOptions.pageSize = pageSize;
                
                $scope.loadPatients();
            });
            
            $scope.loadPatients();
        }
	};
	
	$scope.loadPatients = function() {
		$scope.loadingList=true;

		var sf = $scope.searchFilter;
		sf.limit = paginationOptions.pageSize;
		sf.start = (paginationOptions.pageNumber-1)*sf.limit;
		
		PatientService.getPatients(sf).then(function(response) {
					console.debug('patients');
					console.debug(response);
					if (response) {
						$scope.patientsList.data = response.results;
						$scope.patientsList.totalItems = response.totalCount;

						$scope.loadingList=false;
					}
				},
				function(response) {
					//TODO handle this error and show to user
					console.debug('patients error');
					console.log(response);
				});
	};
}]);

patientApp.controller('PatientProfileController', ['$scope', '$filter', '$state', 'PatientService', 
                       function($scope, $filter, $state, PatientService) {
	if(!$state.params.patient){
		$state.go('patient-list');
	}
	
	$scope.dataMap = {
		patient : $state.params.patient
	};
	
}]);
