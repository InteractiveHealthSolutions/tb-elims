var patientApp = angular.module('app.patient',['patient.filter','app.location','patientService','ui.grid','ui.grid.pagination'
                                              ,'ui.grid.autoResize', 'ui.tree']);

patientApp.controller('PatientListController', ['$scope', '$filter', '$state', 'uiGridConstants', 'PatientService', 
    function($scope, $filter, $state, uiGridConstants, PatientService) {
	
	$scope.searchFilter = {};
	
	var paginationOptions = {
	    pageNumber:1,
	    pageSize: 5,
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
          { name:'Patient ID', width: '20%', field: uiGridConstants.ENTITY_BINDING, cellFilter: 'getIdentifierValue:"OpenMRS ID"' },
          { name:'Name', width: '20%', field: 'person.display' },
          { name:'Age', width: '7%', field: 'person.age'},
          { name:'Sex', width: '8%', field: 'person.gender'},
          { name:'Occupation', width: '15%', field: uiGridConstants.ENTITY_BINDING, cellFilter: 'getAttributeValue:"Occupation"'},
          { name:'Contact No.', width: '15%', field: uiGridConstants.ENTITY_BINDING, cellFilter: 'getAttributeValue:"Primary Contact Number"'},
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
        }
	};
	
	$scope.loadPatients = function() {
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
		
		PatientService.getPatients(sf)
			.then(function(response) {
					console.debug('patients');
					console.debug(response);
					if (response) {
						$scope.patientsList.data = response.results;
						$scope.patientsList.totalItems = response.totalCount;
					}
				},
				function(response) {
					//TODO handle this error and show to user
					console.debug('patients error');
					console.log(response);
				});
	};

	$scope.openProfile = function(currentPatient) {
		console.debug(currentPatient);
		$state.go('patient-profile', {patient: currentPatient});
	}
	
	$scope.attributeValue = function(attributeList, attribute) {
		return $filter("attributeValue")(attributeList, attribute);
	};
	
	$scope.identifierValue = function(identifierList, identifier) {
		console.debug(identifierList);
		console.debug(identifier);
		return $filter("identifierValue")(identifierList, identifier);
	}

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
