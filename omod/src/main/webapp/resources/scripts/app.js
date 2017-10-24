var routerApp = angular.module('app.tbelims',['ui.router','ui.bootstrap', 'app.patient','app.location','app.lab',
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
        })
        .state('lab-list', {
        	url: '/lab-list',
            templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/lab-list.html',
            controller: 'LabListController',
            params: {q: null}
        })
        .state('lab-registration', {
        	url: '/lab-registration',
            templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/lab-registration.html',
            controller: 'LabRegistrationController'
        })
        .state('lab-edit', {
        	url: '/lab-edit',
            templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/lab-edit.html',
            controller: 'LabEditController',
            params: {lab: null}
        })
        .state('lab-profile', {
        	url: '/lab-profile',
            templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/lab-profile.html',
            controller: 'LabProfileController',
            params: {lab: null}
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
			'tbelims.title', 
			'tbelims.refapp.title', 
			
			'tbelims.login.title', 
			'tbelims.login.loginHeading', 
			'tbelims.login.username', 
			'tbelims.login.password', 
			'tbelims.login.username.placeholder', 
			'tbelims.login.password.placeholder', 
			'tbelims.login.button', 
			'tbelims.login.sessionLocation', 
			'tbelims.login.cannotLogin', 
			'tbelims.login.cannotLoginInstructions', 
			
			'tbelims.home.title', 
			'tbelims.home.currentUser', 
			'tbelims.home.logIn', 
			
			'tbelims.homepageExt.description', 
			
			'tbelims.cancel',
			'tbelims.okay', 
			'tbelims.date', 
			
			'tbelims.lab-list.label', 
			'tbelims.lab-list.filter.labType.label', 
			'tbelims.lab-list.filter.organizationType.label', 
			'tbelims.lab-list.filter.q.label', 
			'tbelims.lab-list.filter.trigger.label', 
			
			'tbelims.lab-list.filter.watermark1.label', 
			'tbelims.lab-list.filter.watermark2.label', 
			
			'tbelims.lab-profile.trigger.label', 
			'tbelims.lab-edit.trigger.label', 
			'tbelims.lab-void.trigger.label',
			'tbelims.lab-voided.label',
			
			'tbelims.lab-registration.trigger.label', 
			
			
			'tbelims.lab-registration.label', 
			'tbelims.lab-registration.label.labType', 
			'tbelims.lab-registration.label.registrationDate', 
			'tbelims.lab-registration.label.labName', 
			'tbelims.lab-registration.label.labAddress', 
			'tbelims.lab-registration.label.labAddressId', 
			'tbelims.lab-registration.label.organizationType', 
			'tbelims.lab-registration.label.organizationName', 
			'tbelims.lab-registration.label.labIdentifier', 
			'tbelims.lab-registration.label.save', 
			'tbelims.lab-registration.label.cancel', 
			
			'tbelims.lab-edit.label', 
			'tbelims.lab-edit.label.labType', 
			'tbelims.lab-edit.label.registrationDate', 
			'tbelims.lab-edit.label.labName', 
			'tbelims.lab-edit.label.labAddress', 
			'tbelims.lab-edit.label.organizationType', 
			'tbelims.lab-edit.label.organizationName', 
			'tbelims.lab-edit.label.labIdentifier', 
			'tbelims.lab-edit.label.save', 
			'tbelims.lab-edit.label.cancel', 
			
			
			'tbelims.lab-profile.label', 
			'tbelims.lab-profile.label.labType', 
			'tbelims.lab-profile.label.registrationDate', 
			'tbelims.lab-profile.label.labName', 
			'tbelims.lab-profile.label.labAddress', 
			'tbelims.lab-profile.label.organizationType', 
			'tbelims.lab-profile.label.organizationName', 
			'tbelims.lab-profile.label.labIdentifier'
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
resetGridHeight = function(grid, $scope) {
	if(!grid){
		return;
	}
	var rowHeight = grid.rowHeight; 
    var headerHeight = grid.headerRowHeight; 
    var paginationPageSize = grid.paginationPageSize;
    var dataSize = grid.data.length;
    var pageSize = (dataSize>paginationPageSize||dataSize<6)?paginationPageSize:dataSize;

    $scope.gridHeight = (pageSize * rowHeight + headerHeight*3) + "px";

    console.log('Grid height reset to '+$scope.gridHeight);
};
castDateField = function(modelValue) {
	if(modelValue){
		if(modelValue.length > 10){
			modelValue = modelValue.substr(0, 10);
			console.log(modelValue);
			mv = new Date(modelValue);
			console.log(mv);
			return mv;
		}
		else {
			mv = new Date(modelValue);
			console.log(mv);
			return mv;
		}
	}
	
	return null;
};