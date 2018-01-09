angular.module('encounterService', ['ngResource', 'uicommons.common'])
    .factory('Encounter', function($resource) {
        return $resource("/" + OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/encounterdata/:uuid?v=full", {
            uuid: '@uuid'
        },{
            query: { method:'GET', isArray:false } // OpenMRS RESTWS returns { "results": [] }
        });
    })
    .factory('EncounterService', function(Encounter) {

        return {
            getEncounters: function(params) {
            	params['totalCount'] = true;
                return Encounter.query(params).$promise.then(function(res) {
                    return res;
                });
            }
        }
    });