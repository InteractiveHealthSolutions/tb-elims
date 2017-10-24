angular.module('labService', ['ngResource', 'uicommons.common'])
    .factory('Location', function($resource) {
        return $resource("/" + OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/labdata/:uuid?v=full", {
            uuid: '@uuid'
        },{
            query: { method:'GET', isArray:false } // OpenMRS RESTWS returns { "results": [] }
        });
    })
    .factory('LabService', function(Location) {

        return {
        	getLab: function(uid) {
        		return Location.get({uuid: uid}).$promise.then(function(res) {
                    return res;
                });
			},
            getLabs: function(params) {
            	params['totalCount'] = true;
                return Location.query(params).$promise.then(function(res) {
                    return res;
                });
            },
            saveLab: function(lab) {
                return Location.save(lab).$promise.then(function(res) {
                    return res;
                });
            },
            editLab: function(lab) {
				return Location.save({uuid: lab.uuid}, lab).$promise.then(function(res) {
                    return res;
                });
			},
			voidLab: function(uuid, reason) {
				return Location.delete({uuid: uuid, reason: reason}).$promise.then(function(res) {
                    return res;
                });
			}
        }
    });