angular.module('privilegeService', ['ngResource', 'uicommons.common'])
	.factory('Privilege', function($resource) {
	    return $resource("/" + OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/privilege/:uuid", {
	        uuid: '@uuid'
	    },{
	        query: { method:'GET' }     // override query method to specify that it isn't an array that is returned
	    });
	})
    .factory("PrivilegeService", function(Privilege) {
        return {
            getPrivileges: function(params) {
                return Privilege.query(params).$promise.then(function(res) {
                    return res;
                });
            },
            loadPrivileges: function(scope, key, prefix) {
            	Privilege.query({limit: 99999}).$promise.then(function(res) {
            		console.debug('Loading privileges');
            		console.debug(res);
            		
            		perArr = [];
            		for (var i = 0; i < res.results.length; i++) {
            			var per = res.results[i];
            			if(prefix && per.display.toLowerCase().indexOf(prefix) !== -1){
            				perArr.push(per);
            			}
            			else if(!prefix){
            				perArr.push(per);
            			}
            		}
            		
            		scope[key] = perArr;
            	},
            	function(response) {
            		console.debug('loading privileges error');
            		console.log(response);
            	});
            }
        }

    });
