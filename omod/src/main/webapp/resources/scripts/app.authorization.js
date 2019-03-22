var authorizationApp = angular.module('app.authorization',['base64','session','userService']);

authorizationApp.controller('AuthorizationController', ['$scope', '$filter', '$base64', '$window', 'SessionInfo', 'UserService',
    function($scope, $filter, $base64, $window, SessionInfo, UserService) {
	
	var $translate = $filter('translate');
	
	$scope.login = function() {
		$scope.formErrors = "";
		
		if($scope.username && $scope.password)
		{
			SessionInfo.login($scope.username, $scope.password).then(function(sobj) {
				console.debug(sobj);
				
				if(sobj.authenticated){
					console.log('authenticated user');
					$window.location.href = '/openmrs/tbelims/app.page#/lab-list';
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
	
	$scope.forgotPassword = function() {
		$scope.formErrors = "";
		
		if($scope.fg_username)
		{
			UserService.getUsers({username: $scope.fg_username}).then(function(response) {
				console.debug('users');
				console.debug(response);
				if (response && response.results.length > 0) {
					
				}
				else {
					$scope.formErrors = $translate("tbelims.login.cannotLogin.error.usernameInvalid");
				}
			},
			function(response) {
				console.log(response);
				$scope.formErrors = $translate("tbelims.login.cannotLoginInstructions");
			});
		}
		else {
			$scope.formErrors = $translate("tbelims.login.cannotLogin.error.usernameMissing");
		}
	}
}])
.controller('LogoutController', ['$scope', '$state', 'SessionInfo', function($scope, $state, SessionInfo) {
	$scope.logout = function() {
		try{
			console.log('Logging out session');
			sobj = SessionInfo.logout();
			
			$state.go('login');
		}
		catch (e) {
			// TODO some good way to response back
			alert('Unable to terminate session due to an error '+e);
		}
	};
}]);
