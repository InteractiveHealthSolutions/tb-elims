var authorizationApp = angular.module('app.authorization',['base64','session']);

authorizationApp.controller('AuthorizationController', ['$scope', '$base64', '$window', 'SessionInfo', 
    function($scope, $base64, $window, SessionInfo) {
	
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
