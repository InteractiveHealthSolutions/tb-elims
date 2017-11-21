var routerApp = angular.module('app.tbelims',['ui.router','ui.bootstrap', 
             'app.patient','app.location','app.lab','app.role','app.user','app.authorization','session']);

var fillStateInfo = function(stateProvider, state, url, page, controller, params) {
	stateProvider.state(state, {
        url: url,
        templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/'+page+'.html',
        controller: controller,
        params: params
    });
};

routerApp.config(function($stateProvider, $urlRouterProvider) {
	fillStateInfo($stateProvider, 'empty', '', 'login', 'AuthorizationController');
	fillStateInfo($stateProvider, 'login', '/login', 'login', 'AuthorizationController');
	fillStateInfo($stateProvider, 'logout', '/logout', 'login', 'LogoutController');
	fillStateInfo($stateProvider, 'patient-list', '/patient-list', 'patient-list', 'PatientListController');
	fillStateInfo($stateProvider, 'patient-profile', '/patient-profile', 'patient-profile', 'PatientProfileController', {patient: null});
    fillStateInfo($stateProvider, 'lab-list', '/lab-list', 'lab-list', 'LabListController',{q: null});
    fillStateInfo($stateProvider, 'lab-registration', '/lab-registration', 'lab-registration', 'LabRegistrationController');
	fillStateInfo($stateProvider, 'lab-edit','/lab-edit', 'lab-edit', 'LabEditController', {lab: null});
    fillStateInfo($stateProvider, 'lab-profile','/lab-profile', 'lab-profile', 'LabProfileController', {lab: null});
    fillStateInfo($stateProvider, 'role-list','/role-list', 'role-list', 'RoleListController');
    fillStateInfo($stateProvider, 'user-list','/user-list', 'user-list', 'UserListController', {q: null});
    fillStateInfo($stateProvider, 'user-registration','/user-registration', 'user-registration', 'UserRegistrationController');
    fillStateInfo($stateProvider, 'user-access-control','/user-access-control', 'user-access-control', 'UserAccessControlController');
    fillStateInfo($stateProvider, 'user-edit', '/user-edit', 'user-edit', 'UserEditController', {user: null});
    fillStateInfo($stateProvider, 'user-profile', '/user-profile', 'user-profile', 'UserProfileController', {user: null});
})
.controller('LogoutController', ['$scope', '$state', 'SessionInfo', function($scope, $state, SessionInfo) {
	$scope.logout = function() {
		try{
			console.debug('Logging out session');
			sobj = SessionInfo.logout();
			
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
    	currentSess = SessionInfo.get();
    	if(!currentSess || !currentSess.authenticated){
    		var msgCodes = [
	            'tbelims.title', 'tbelims.refapp.title', 'tbelims.login.title', 'tbelims.login.loginHeading', 'tbelims.login.username', 'tbelims.login.password', 'tbelims.login.username.placeholder', 'tbelims.login.password.placeholder', 'tbelims.login.button', 'tbelims.login.sessionLocation', 'tbelims.login.cannotLogin', 'tbelims.login.cannotLoginInstructions', 'tbelims.home.title', 'tbelims.home.currentUser', 'tbelims.home.logIn', 'tbelims.homepageExt.description', 'tbelims.okay', 'tbelims.submit', 'tbelims.cancel', 'tbelims.date', 'tbelims.stateProvince.label', 'tbelims.countyDistrict.label', 'tbelims.cityVillage.label', 'tbelims.address3.label', 'tbelims.lab.label', 'tbelims.role.label', 'tbelims.user.query.label', 'tbelims.lab-list.label', 'tbelims.lab-list.filter.labType.label', 'tbelims.lab-list.filter.organizationType.label', 'tbelims.lab-list.filter.q.label', 'tbelims.lab-list.filter.trigger.label', 'tbelims.data-list.filter.watermark1.label', 'tbelims.data-list.filter.watermark2.label', 'tbelims.lab-profile.trigger.label', 'tbelims.lab-edit.trigger.label', 'tbelims.lab-void.trigger.label', 'tbelims.lab-voided.label', 'tbelims.lab-void.reason.label', 'tbelims.lab-registration.trigger.label', 'tbelims.lab-registration.label', 'tbelims.lab-registration.label.labType', 'tbelims.lab-registration.label.registrationDate', 'tbelims.lab-registration.label.labName', 'tbelims.lab-registration.label.labAddress', 'tbelims.lab-registration.label.labAddressId', 'tbelims.lab-registration.label.organizationType', 'tbelims.lab-registration.label.organizationName', 'tbelims.lab-registration.label.labIdentifier', 'tbelims.lab-registration.label.save', 'tbelims.lab-registration.label.cancel', 'tbelims.lab-edit.label', 'tbelims.lab-edit.label.labType', 'tbelims.lab-edit.label.registrationDate', 'tbelims.lab-edit.label.labName', 'tbelims.lab-edit.label.labAddress', 'tbelims.lab-edit.label.organizationType', 'tbelims.lab-edit.label.organizationName', 'tbelims.lab-edit.label.labIdentifier', 'tbelims.lab-edit.label.save', 'tbelims.lab-edit.label.cancel', 'tbelims.lab-edit.label.warningIdentifier', 'tbelims.lab-profile.label', 'tbelims.lab-profile.label.labType', 'tbelims.lab-profile.label.registrationDate', 'tbelims.lab-profile.label.labName', 'tbelims.lab-profile.label.labAddress', 'tbelims.lab-profile.label.organizationType', 'tbelims.lab-profile.label.organizationName', 'tbelims.lab-profile.label.labIdentifier', 'tbelims.role-list.label', 'tbelims.role-list.filter.roleName.label', 'tbelims.role-registration.trigger.label', 'tbelims.role-registration.label', 'tbelims.role-registration.label.roleName', 'tbelims.role-registration.label.roleEditWarning', 'tbelims.role-void.label', 'tbelims.role-void.confirmation.label', 'tbelims.role-void.failed.label', 'tbelims.user-list.label', 'tbelims.user-registration.trigger.label', 'tbelims.user-registration.label', 'tbelims.user-registration.label.firstName', 'tbelims.user-registration.label.lastName', 'tbelims.user-registration.label.designation', 'tbelims.user-registration.label.organization', 'tbelims.user-registration.label.contactNumber', 'tbelims.user-registration.label.email', 'tbelims.user-registration.label.username', 'tbelims.user-registration.label.password', 'tbelims.user-registration.label.confirmPassword', 'tbelims.user-registration.label.role', 'tbelims.user-registration.label.address', 'tbelims.user-registration.label.location', 'tbelims.user-edit.trigger.label', 'tbelims.user-edit.label', 'tbelims.user-edit.label.firstName', 'tbelims.user-edit.label.lastName', 'tbelims.user-edit.label.designation', 'tbelims.user-edit.label.organization', 'tbelims.user-edit.label.contactNumber', 'tbelims.user-edit.label.email', 'tbelims.user-edit.label.username', 'tbelims.user-edit.label.password', 'tbelims.user-edit.label.confirmPassword', 'tbelims.user-edit.label.role', 'tbelims.user-edit.label.address', 'tbelims.user-edit.label.location','tbelims.user-profile.trigger.label', 'tbelims.user-profile.label', 'tbelims.user-profile.label.firstName', 'tbelims.user-profile.label.lastName', 'tbelims.user-profile.label.designation', 'tbelims.user-profile.label.organization', 'tbelims.user-profile.label.contactNumber', 'tbelims.user-profile.label.email', 'tbelims.user-profile.label.username', 'tbelims.user-profile.label.role', 'tbelims.user-profile.label.address', 'tbelims.user-profile.label.location','tbelims.user-void.reason.label','tbelims.user-void.trigger.label','tbelims.user-edit.trigger.label','tbelims.user-voided.label','tbelims.user-access-control.label', 'tbelims.error.login.fail', 'tbelims.error.loadApps.fail', 'tbelims.login.error.invalidLocation', 'tbelims.login.error.locationRequired', 'tbelims.app.errors.invalidJson', 'tbelims.app.errors.serverError', 'tbelims.app.errors.IdsShouldMatch', 'tbelims.app.errors.duplicateAppId'
	        ];
	
	    	console.info("Loading i18n messages");
	
	    	emr.loadMessages(msgCodes.toString(), function(msgs) {
	        	console.debug(msgs);
	        	$rootScope.msgs = msgs;
	        });
    		        	
    		$location.path("/login");
    	}
    	else if(!toState.name || toState.name === ''){
    		$location.path("/lab-list");
    	}
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

    console.debug('Grid height reset to '+$scope.gridHeight);
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
var compareTo = function() {
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=compareTo"
      },
      link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function() {
          ngModel.$validate();
        });
      }
    };
};
routerApp.directive("compareTo", compareTo);