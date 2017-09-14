var routerApp = angular.module('app.tbelims',['ui.router','ui.bootstrap','app.patient','app.location',
                                             'app.authorization','session']);

routerApp.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider
	    .state('login', {
	        url: '/login',
	        templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/login.html',
	        controller: 'AuthorizationController'
	    }) 
	    .state('logout', {
	        url: '/logout',
	        templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/login.html',
	        controller: 'LogoutController'
	    }) 
	    .state('home', {
            url: '/home',
            templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/home.html'
        })

        .state('about', {
            // we'll get to this in a bit
        })
        .state('patient-list', {
        	url: '/patient-list',
            templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/patient-list.html',
            controller: 'PatientListController'
        })
        .state('patient-profile', {
        	url: '/patient-profile',
            templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/patient-profile.html',
            controller: 'PatientProfileController',
            params: {patient: null}
        });

})
.controller('LogoutController', ['$scope', '$state', 'SessionInfo', function($scope, $state, SessionInfo) {
	$scope.logout = function() {
		try{
			console.debug('Logging out session');
			sobj = SessionInfo.logout();
			console.debug(sobj);
			
			$state.go('login');
		}
		catch (e) {
			// TODO some good way to response back
			alert('Unable to terminate session due to an error '+e);
		}
	};
}])
.run(['$rootScope', '$location', 'SessionInfo', '$state', function ($rootScope, $location, SessionInfo, $state) {
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

    	 // Loading i18n messages
        var msgCodes = [
        "tbelims.login.title",
        "tbelims.login.loginHeading",
        "tbelims.login.username",
        "tbelims.login.password",
        "tbelims.login.username.placeholder",
        "tbelims.login.password.placeholder",
        "tbelims.login.button",
        "tbelims.login.cannotLogin",
        "tbelims.login.cannotLoginInstructions",
        "coreapps.yes",
        "coreapps.no"
        ]

    	console.debug("CHECKNG MSGS");

        emr.loadMessages(msgCodes.toString(), function(msgs) {
        	console.debug(msgs);
        	$rootScope.msgs = msgs;
        });
        
    	var suppressAuthentication = toState.data && !toState.data.requiresLogin;
    	// check if session is active
        SessionInfo.login(null, null).then(function(response) {
        		console.debug('loggedIn: ');
        		console.debug(response);
	        	if (!suppressAuthentication && !(response && response.authenticated)) {
	                $location.path("/login");
	            }
			}).catch(function(error) {
				alert(error);
			});
    });
}]);

// Copied from ebola-example to suppress the ui-common module authentication
// popup
angular.module('uicommons.common', []).

	factory('http-auth-interceptor', function($q, $rootScope) {
	    return {
	        responseError: function(response) {
	            if (response.status === 401 || response.status === 403) {
	                $rootScope.$broadcast('event:auth-loginRequired');
	            }
	            return $q.reject(response);
	        }
	    }
	}).
	config(function($httpProvider) {
	    $httpProvider.interceptors.push('http-auth-interceptor');
	
	    // to prevent the browser from displaying a password pop-up in case of
		// an authentication error
	    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = 'true';
	}).
	run(['$rootScope', '$location', function ($rootScope, $location) {		
	    $rootScope.$on('event:auth-loginRequired', function () {
	        console.log('AUTH REQUIRED');
	        $location.path("/login");
	    });
}]);