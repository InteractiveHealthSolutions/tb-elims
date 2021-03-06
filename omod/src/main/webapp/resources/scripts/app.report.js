var reportApp = angular.module('app.report',['app.location','reportService']);

reportApp.controller('ReportController', ['$scope','$uibModal','$filter', 'ReportService', 'LocationService',
                function($scope, $uibModal, $filter, ReportService, LocationService) {
	
	$scope.today = new Date();
	$scope.previousYearDate = new Date();
	$scope.previousYearDate.setFullYear($scope.today.getFullYear() - 1);

	LocationService.loadLocationsByTag('division', $scope, 'divisions');
	LocationService.loadLocationsByTag('district', $scope, 'districts');
	
	$scope.case_findings = [];
	$scope.followups = [];
	$scope.xpert_case_findings = [];
	$scope.totals = [];
	
	$scope.searchFilter = {};
	
	$scope.loadreports = function() {
		sf = {};
		sf.locationId = $scope.searchFilter.lab || $scope.searchFilter.address3 || $scope.searchFilter.cityVillage 
						|| $scope.searchFilter.countyDistrict || $scope.searchFilter.stateProvince;
		
		if($scope.searchFilter.dateFrom){
			sf.from = $scope.searchFilter.dateFrom.toISOString().substring(0, 10);
		}
		if($scope.searchFilter.dateTo){
			sf.to = $scope.searchFilter.dateTo.toISOString().substring(0, 10);
		}
		
		$scope.loadingData = true;
		
		console.debug('sf');
		console.debug(sf);
		
		ReportService.getReport('r_case_findings', sf).then(function(response) {
			$scope.case_findings = response.report;
		});
		
		ReportService.getReport('r_followup_examinations', sf).then(function(response) {
			$scope.followups = response.report;
		});

		ReportService.getReport('r_case_findings_by_xpert', sf).then(function(response) {
			$scope.xpert_case_findings = response.report;
		});
		
		ReportService.getReport('r_total', sf).then(function(response) {
			$scope.totals = response.report;
			
			$scope.loadingData = false;
		});
	}
	
	$scope.loadreports();
	
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
