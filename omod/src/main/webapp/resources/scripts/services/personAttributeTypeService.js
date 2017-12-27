angular.module('personAttributeTypeService', ['ngResource', 'uicommons.common'])
    .factory('PersonAttributeType', function($resource) {
        return $resource("/" + OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/personattributetype/:uuid?v=full", {
            uuid: '@uuid'
        },{
            query: { method:'GET', isArray:false } // OpenMRS RESTWS returns { "results": [] }
        });
    })
    .factory('PersonAttributeTypeService', function(PersonAttributeType) {

        return {
        	getPersonAttributeType: function(uid) {
        		return PersonAttributeType.get({uuid: uid}).$promise.then(function(res) {
                    return res;
                });
			},
            getPersonAttributeTypeByName: function(name) {
                return PersonAttributeType.query({q: name}).$promise.then(function(res) {
                    return res;
                });
            },
            getPersonAttributeTypes: function(params) {
                return PersonAttributeType.query(params).$promise.then(function(res) {
                    return res;
                });
            }
        }
    });