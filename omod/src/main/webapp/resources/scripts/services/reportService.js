angular.module('reportService', ['ngResource', 'uicommons.common'])
.factory('ReportService', function($http,$filter) {
	var reportService = {    	
		getReport: function(id, params) {
			console.debug("Fetching report "+id);
	      // $http returns a promise, which has a then function, which also returns a promise
	      return $http({method: "GET", url:'/openmrs/data/rest/tbelims/report/data.json?reportId='+id, params:params}).then(function (response) {
	        // The then function here is an opportunity to modify the response
				console.debug("Fetched report "+id);
				console.log(response);
	        // The return value gets picked up by the then in the controller.
	        return response.data;
	      });
	    }
	};
	return reportService;
});