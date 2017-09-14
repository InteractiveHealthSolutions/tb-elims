angular.module('patientService', ['ngResource', 'uicommons.common'])
    .factory('Patient', function($resource) {
        return $resource("/" + OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/patientdata/:uuid?v=full", {
            uuid: '@uuid'
        },{
            query: { method:'GET', isArray:false } // OpenMRS RESTWS returns { "results": [] }
        });
    })
    .factory('PatientService', function(Patient) {

        return {
            getPatients: function(params) {
            	params['totalCount'] = true;
                return Patient.query(params).$promise.then(function(res) {
                    return res;
                });
            }
        }
    });