var authorizationApp = angular.module('app.authorization',['base64','session']);

authorizationApp

.controller('AuthorizationController', ['$scope', '$base64', '$window', 'SessionInfo', 
    function($scope, $base64, $window, SessionInfo) {
	
	$scope.login = function() {
		$scope.formErrors = "";
		
		if($scope.username && $scope.password)
		{
			SessionInfo.login($scope.username, $scope.password)
				.then(function(sobj) {
					console.debug('resppppppppp:');
					console.debug(sobj);
					
					if(sobj.authenticated){
						console.log('authenticated user');
						$window.location.href = '/openmrs/tbelims/app.page#/patient-list';
					}
					else {
						$scope.formErrors = "Invalid username or password.";
					}
				})
				.catch(function(error) {
					$scope.formErrors = "Error while authenticating "+error;
				});
		}
	}
}]);

//authorizationApp.service("AuthorizationService", ["$http", "$resource",
//    function ($http, CurrentSession) {
//    return {
//        login: function (username, provider) {
//            return $http.post("/" + OPENMRS_CONTEXT_PATH + "/ws/rest/v1/ebola/login", {'username': username, 'provider': String(provider)})
//                .success(function (response) {
//                    CurrentSession.setInfo(response);
//                });
//        }
//    }
//}]);