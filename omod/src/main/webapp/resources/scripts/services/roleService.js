angular.module('roleService', ['ngResource', 'uicommons.common'])
    .factory('Role', function($resource) {
        return $resource("/" + OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/role/:uuid?v=full", {
            uuid: '@uuid'
        },{
            query: { method:'GET', isArray:false } // OpenMRS RESTWS returns { "results": [] }
        });
    })
    .factory('RoleService', function(Role) {

        return {
        	getRole: function(uid) {
        		return Role.get({uuid: uid}).$promise.then(function(res) {
                    return res;
                });
			},
            getRoles: function(params) {
                return Role.query(params).$promise.then(function(res) {
                    return res;
                });
            },
            saveRole: function(role) {
            	//TODO bad workaround
            	role.description = 'eLIMS';
                return Role.save(role).$promise.then(function(res) {
                    return res;
                });
            },
            editRole: function(role) {
				return Role.save({uuid: role.uuid}, role).$promise.then(function(res) {
                    return res;
                });
			},
			voidRole: function(uuid) {
				return Role.delete({uuid: uuid, purge:true}).$promise.then(function(res) {
                    return res;
                });
			},
			loadRoles: function(scope, key, regex) {
				Role.query({limit: 99999}).$promise.then(function(response) {
					console.debug('Loading roles');
					console.debug(response);
					
					if (response) {
						if(!scope[key]){
							scope[key] = [];
						}
						
						for (var i = 0; i < response.results.length; i++) {
							var arrElem = response.results[i];
							//TODO bad workaround
							if(arrElem.description && arrElem.description.toLowerCase().indexOf('elims') !== -1){
								scope[key].push(arrElem);
							}
						}
					}
				},
				function(response) {
					//TODO handle this error and show to user
					console.debug('loading roles error');
					console.log(response);
				});
			},
			loadRolePrivilegeMap: function(scope, key, privilegeKey, regex) {
				Role.query({limit: 99999}).$promise.then(function(response) {
					console.debug('Loading roles');
					console.debug(response);
					
					if (response) {
						scope[key] = [];

						for (var i = 0; i < response.results.length; i++) {
							var arrElem = response.results[i];
							
							if(arrElem.description && arrElem.description.toLowerCase().indexOf('elims') !== -1){
								// pushing role to map to be used on UI so that existing permissions can be marked as checked						
								// looping over all permissions to add to roleMap so that it can be pushed to server if saved or shown on UI
								console.debug(arrElem.name + " has following permissions ");
								
								scope[key].push(arrElem);
								scope[key][arrElem.name] = {};
								scope[key][arrElem.name][privilegeKey] = {};
								
								if(arrElem.privileges && arrElem.privileges.length > 0){
									for (var j = 0; j < arrElem.privileges.length; j++) {
										var perm = arrElem.privileges[j];			
										scope[key][arrElem.name][privilegeKey][perm.display] = true;
									}
								}
							}
						}
						
						console.debug(scope[key]);

					}
				},
				function(response) {
					//TODO handle this error and show to user
					console.debug('loading roles error');
					console.log(response);
				});
			}
        }
    });