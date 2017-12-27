angular.module('userService', ['ngResource', 'uicommons.common'])
    .factory('User', function($resource) {
        return $resource("/" + OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/userdata/:uuid?v=full", {
            uuid: '@uuid'
        },{
            query: { method:'GET', isArray:false } // OpenMRS RESTWS returns { "results": [] }
        });
    })
    .factory('UserService', function(User) {

        return {
        	getUser: function(uid) {
        		return User.get({uuid: uid}).$promise.then(function(res) {
                    return res;
                });
			},
            getUsers: function(params) {
            	params['totalCount'] = true;
                return User.query(params).$promise.then(function(res) {
                    return res;
                });
            },
			saveUser: function(user) {
                return User.save(user).$promise.then(function(res) {
                    return res;
                });
            },
            editUser: function(user) {
				return User.save({uuid: user.uuid}, user).$promise.then(function(res) {
                    return res;
                });
			},
			voidUser: function(uuid, reason) {
				return User.delete({uuid: uuid, reason: reason}).$promise.then(function(res) {
                    return res;
                });
			}
        }
    });