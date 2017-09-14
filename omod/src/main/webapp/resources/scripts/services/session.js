angular.module('session', ['ngResource','base64'])
	.config([ '$httpProvider',   function($httpProvider) {
	    $httpProvider.interceptors.push('HTTPAPIInterceptor');
	 }])
	 .factory('SessionConfig', [ '$base64', function($base64) {
		username = '';
		passcode = '';
		cached = {};
		
	    return {
	    	get: function() {
	    		return cached;
			},
	        set: function(cacheable) {
	        	cached = cacheable;
	        },
	        clear: function() {
	        	cached = {};
	        	username = '';
	    		passcode = '';
	        },
	        setCredentials: function(user, pass) {
	        	username = user;
	        	passcode = pass;
			},
	        // must call setCredentials before this to init the data
	        getCurrentAuthToken: function() {
	        	return $base64.encode(username + ':' + passcode);
			}
	    }
	}])
	 .service('HTTPAPIInterceptor', ['SessionConfig', function(SessionConfig) {
		 var service = this;
	
	     service.request = function(config) {
	    	 if(config.url.indexOf('/session') !== -1){
		    	 console.debug('config');
		    	 console.debug(config);
		         config.headers['Authorization'] = 'Basic '+SessionConfig.getCurrentAuthToken();
	    	 }
	         return config;
	     };
	 }])
	.factory('Session', ['$resource', 'HTTPAPIInterceptor', function($resource, HTTPAPIInterceptor) {
		return $resource('/' + OPENMRS_CONTEXT_PATH + '/ws/rest/v1/session', {}, {
			get : { method:'GET', interceptor: HTTPAPIInterceptor}
		});
	}])
	
    .factory('SessionInfo', [ 'SessionConfig', 'Session', function(SessionConfig, Session) {
    	return {
        	get: function() {
        		return SessionConfig.get();
			},
            login: function(user, pass) {
            	SessionConfig.setCredentials(user, pass);
            	
                // must call setCredentials before this to init the data, the call GET which would intercepted and 
            	// filled with token, then set result as cached in SessionConfig
                return Session.get().$promise.then(function(resp) {
                	SessionConfig.set(resp);
                	
                    return resp;
                });
            },
            logout: function() {
            	Session.delete();
            	
            	SessionConfig.clear();
            },
            hasPrivilege: function(privilege) {
                return new OpenMRS.UserModel(this.get().user).hasPrivilege(privilege);
            }
        }
    }]);