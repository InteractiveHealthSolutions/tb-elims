var routerApp = angular.module('app.tbelims',['ui.router','ui.bootstrap','pascalprecht.translate', 
             'app.patient','app.location','app.lab','app.role','app.user','app.authorization','session']);

var fillStateInfo = function(stateProvider, state, url, page, controller, params) {
	var data = {
        url: url,
        templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/'+page+'.html',
        controller: controller,
        params: params
    };
	// if page has a dom
	if(page.indexOf('<') !== -1 && page.indexOf('>') !== -1){
		data = {
	        url: url,
	        template: page,
	        params: params
	    };
	}
	stateProvider.state(state, data);
};

routerApp.config(function($stateProvider, $urlRouterProvider) {
	fillStateInfo($stateProvider, 'empty', '', 'login', 'AuthorizationController');
	fillStateInfo($stateProvider, '404', '', '<h1>Page Not Found. Make sure to hit valid URL</h1>');
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
    
    $urlRouterProvider.otherwise(function($injector, $location){
	   var state = $injector.get('$state');
	   state.go('404');
	   return $location.path();
    });
})
.config(function ($translateProvider) {
    $translateProvider.useUrlLoader('/openmrs/data/rest/tbelims/localization/messages.json');
    $translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.useStorage('UrlLanguageStorage');
    $translateProvider.preferredLanguage('en');
    $translateProvider.fallbackLanguage('en');
})
.controller('LanguageController', ['$scope','$translate','$location', function($scope, $translate, $location) {
    $scope.changeLanguage = function (locale) {
        $translate.use(locale);
        $location.search('lang', locale);
        //window.location.href = $location.absUrl();
        //window.location.reload();
    };
}])
.factory('UrlLanguageStorage', ['$location', function($location) {
    return {
        put: function (name, value) {},
        get: function (name) {
            return $location.search()['lang']
        }
    };
}])
.run(['$rootScope', '$location', 'SessionInfo', '$state', function ($rootScope, $location, SessionInfo, $state) {
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    	SessionInfo.login().then(function(response) {
    		currentSess = response;
    		console.debug(currentSess);

        	if(!currentSess || !currentSess.authenticated){
        		$location.path("/login");
        	}
        	else if(!toState.name || toState.name === ''){
        		$location.path("/lab-list");
        	}			
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