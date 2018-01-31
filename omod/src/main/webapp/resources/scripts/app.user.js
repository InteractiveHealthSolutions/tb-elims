var userApp = angular.module('app.user',['person.filter','app.location','app.role','userService','roleService',
    'locationService','personAttributeTypeService', 'ui.grid','ui.grid.pagination','ui.grid.autoResize', 'ui.tree']);

userApp.controller('UserController', ['$scope', '$filter', '$state', 'uiGridConstants', 'LocationService','UserService','RoleService',
       function($scope, $filter, $state, uiGridConstants, LocationService, UserService, RoleService) {

	var $translate = $filter('translate');

	RoleService.loadRoles($scope, 'roles');
	
	LocationService.loadLocationsByTag('division', $scope, 'divisions');
	LocationService.loadLocationsByTag('district', $scope, 'districts');
	
	$scope.openProfile = function(current) {
		$state.go('user-profile', {user: current});
	}
	
	$scope.editProfile = function(current) {
		$state.go('user-edit', {user: current});
	}

	$scope.registerProfile = function() {
		$state.go('user-registration');
	}
	
	$scope.cancelRegistration = function() {
		if (confirm($translate('tbelims.user-registration.label.cancel'))) {
			$state.go('user-list');
		}
	}
	
	$scope.cancelEdit = function() {
		if (confirm($translate('tbelims.user-edit.label.cancel'))) {
			$state.go('user-list');
		}
	}
	
	$scope.voidProfile = function(current) {
		if(!$scope.voidReason){
			alert($translate('tbelims.user-void.reason.missing.warning'));
			return;
		}
		UserService.voidUser(current.uuid, $scope.voidReason).then(function(res) {
			console.debug('User voided');
			$state.go('user-list');
		},
		function(response) {
			console.debug('user void error');
			console.log(response);
			alert('Error voiding user');
		});
	}
}]);
userApp.controller('UserListController', ['$scope', '$filter', '$state', 'uiGridConstants', 'UserService', 'RoleService', 'LocationService',
    function($scope, $filter, $state, uiGridConstants, UserService, RoleService, LocationService) {
	
	$scope.searchFilter = {};
	if($state.params.q){
		$scope.searchFilter.q = $state.params.q;
	}
	
	var paginationOptions = {
	    pageNumber:1,
	    pageSize: 20,
	};
	
	// Initializing data grid default options
	$scope.usersList = {
        enableSorting: false,
        enableColumnMenus: false,
        rowHeight:35,
        paginationPageSizes: [5, 20, 40, 60],
        paginationPageSize: paginationOptions.pageSize,
        useExternalPagination: true, 
        columnDefs: [
          { name:'User ID', width: '20%', field: 'username' },
          { name:'Name', width: '20%', field: 'person.display' },
          { name:'Designation', width: '15%', field: uiGridConstants.ENTITY_BINDING, cellFilter: 'getAttributeValueOf:"person":"Designation"'},
          { name:'Organization', width: '15%', field: uiGridConstants.ENTITY_BINDING, cellFilter: 'getAttributeValueOf:"person":"Organization"'},
          { name: 'Edit', width: '15%', field: 'uuid', cellTemplate: 'edit-profile-button.html'},
          { name: 'Profile', width: '15%', field: 'uuid', cellTemplate: 'view-profile-button.html'}
          ],
        data: [],
        onRegisterApi: function (gridApi) {       
        	// make grid adapt to height according to page size or resultset
            gridApi.core.on.rowsRendered(null, function(gridApi) {
            	resetGridHeight($scope.usersList, $scope);
			});
            
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            	paginationOptions.pageNumber = newPage;
                paginationOptions.pageSize = pageSize;
                
                $scope.loadUsers();
            });
            
            $scope.loadUsers();
        }
	};
	
	$scope.loadUsers = function() {
		$scope.loadingList=true;

		console.debug('fetching data using searchFilter');
		console.debug($scope.searchFilter);
		
		//TODO repetition in code
		var sf = $scope.searchFilter;
		sf.limit = paginationOptions.pageSize;
		sf.start = (paginationOptions.pageNumber-1)*sf.limit;
		
		UserService.getUsers(sf).then(function(response) {
					console.debug('users');
					console.debug(response);
					if (response) {
						usrArr = [];
						for (var i = 0; i < response.results.length; i++) {
							var arrElem = response.results[i];
							if(/^(admin|daemon)$/i.test(arrElem.username) == false){
								usrArr.push(arrElem);
							}
						}
						
						$scope.usersList.data = usrArr;
						$scope.usersList.totalItems = response.totalCount;

						$scope.loadingList=false;
					}
				},
				function(response) {
					//TODO handle this error and show to user
					console.debug('users error');
					console.log(response);
				});
	};
}]);
userApp.controller('UserProfileController', ['$scope', '$filter', '$state', 'UserService', 
                       function($scope, $filter, $state, UserService) {
	if(!$state.params.user){
		$state.go('user-list');
	}
	
	$scope.user = $state.params.user;

	$scope.location = $state.params.user.location;
	$scope.attributes = {};
	
	attrL = $scope.user.person.attributes;
	if (attrL) {
		for (var i = 0; i < attrL.length; i++) {
			var pat = attrL[i];
			
			attrName = (pat.attributeType.name||pat.attributeType.display).toLowerCase();
			$scope.attributes[attrName] = {};
			$scope.attributes[attrName].value = pat.value.display||pat.value;
			$scope.attributes[attrName].dataUuid = pat.uuid;
			
		}
	}	
}]);
userApp.controller('UserRegistrationController', ['$scope', '$rootScope', '$filter', '$state', 'UserService', 'RoleService', 
                                                  'LocationService','PersonAttributeTypeService',
                       function($scope, $rootScope, $filter, $state, UserService, RoleService, LocationService,PersonAttributeTypeService) {

	$scope.user = {};
	$scope.user.person = {};
	$scope.user.person.names = [];
	$scope.user.person.attributes = [];
	$scope.user.roles = [];

	$scope.location = {};
	$scope.attributes = {};
	$scope.loadingData = false;

	// loading person attribute types in scope to bind with UI
	PersonAttributeTypeService.loadPersonAttributeTypes($scope, 'attributes');
	
	$scope.submitForm = function(isValid) {
		if(!isValid){
			return;
		}
		
		if(!$scope.location.lab && $scope.user.roles.length > 0 && $scope.user.roles[0].display.toLowerCase().indexOf('lab tech') !== -1){
			alert('Lab technician MUST be mapped on a Lab');
			return;
		}
		
		console.log('Submitting new User');
		
		/// reset selected role to remove all other fields except uuid
		selectedRole = {uuid: $scope.user.roles[0].uuid};
		$scope.user.roles[0] = selectedRole;
		
		// binding user location to the lowest level specified
		userLocation = $scope.location.lab || $scope.location.address3 || $scope.location.cityVillage 
					|| $scope.location.countyDistrict || $scope.location.stateProvince;
		
		console.log($scope.attributes);
		
		$scope.user.person.gender="U";// gender is mandatory but app doesnot need it
		$scope.user.person.attributes.push({attributeType:$scope.attributes['email'].uuid, value: $scope.attributes.email.value});
		$scope.user.person.attributes.push({attributeType:$scope.attributes['designation'].uuid, value: $scope.attributes.designation.value});
		$scope.user.person.attributes.push({attributeType:$scope.attributes['organization'].uuid, value: $scope.attributes.organization.value});
		$scope.user.person.attributes.push({attributeType:$scope.attributes['primary contact number'].uuid, value: $scope.attributes['primary contact number'].value});
		
		if(userLocation){
			$scope.user.person.attributes.push({attributeType:$scope.attributes['health center'].uuid, value: userLocation});
		}
		
		console.debug($scope.user);
		
		UserService.saveUser($scope.user).then(function(res) {
				console.debug('User Submission result');
				console.debug(res);
				if(res.uuid){
					$state.go('user-list', {q: res.username});
				}
				else {
					alert('No uuid found in response. Contact program vendor');
				}
			},
			function(response) {
				console.debug('user');
				console.log(response);
				alert('Error saving user. '+response.data.error.message);
			});
	};
}]);

userApp.controller('UserEditController', ['$scope', '$rootScope', '$filter', '$state', 
                          'UserService', 'RoleService', 'LocationService','PersonAttributeTypeService',
                       function($scope, $rootScope, $filter, $state, UserService, RoleService, LocationService,PersonAttributeTypeService) {

	if(!$state.params.user){
		$state.go('user-list');
	}
	
	editableUser = $state.params.user;
	
	$scope.user = {};
	$scope.user.person = {};
	$scope.user.person.preferredName = {};
	$scope.user.person.attributes = [];
	$scope.user.roles = [];
	
	$scope.location = {};
	$scope.attributes = {};
	$scope.loadingData = false;
	$scope.formNotInitable = true;
	
	// loading person attribute types in scope to bind with UI
	PersonAttributeTypeService.loadPersonAttributeTypes($scope, 'attributes', null, 'formNotInitable');
	
	$scope.initForm = function() {
		$scope.loadingData = true;

		// copy fields to be updated. no extra fields should be sent as extra data throws exception for resource operation not supported
		$scope.user.uuid = editableUser.uuid;
		$scope.user.username = editableUser.username;
		$scope.user.person.uuid = editableUser.person.uuid;
		$scope.user.person.preferredName.uuid = editableUser.person.preferredName.uuid;
		$scope.user.person.preferredName.givenName = editableUser.person.preferredName.givenName;
		$scope.user.person.preferredName.familyName = editableUser.person.preferredName.familyName;

		$scope.user.roles[0] = {};
		$scope.user.roles[0] = editableUser.roles[0];

		attrL = editableUser.person.attributes;
		if (attrL) {
			for (var i = 0; i < attrL.length; i++) {
				var pat = attrL[i];
				
				attrName = (pat.attributeType.name||pat.attributeType.display).toLowerCase();
				$scope.attributes[attrName].value = pat.value.display||pat.value;
				$scope.attributes[attrName].dataUuid = pat.uuid;
				
				if(attrName.indexOf('health center') !== -1 || attrName === 'location'){
					LocationService.getLocation(pat.value.display).then(function(response) {
						$scope.location.stateProvince = response.stateProvince;
						$scope.location.countyDistrict = response.countyDistrict;
						$scope.location.cityVillage = response.cityVillage;
						$scope.location.address3 = response.address3;
						
						for (var i = 0; i < response.tags.length; i++) {
							var t = response.tags[i].name;
							if(t.toLowerCase().indexOf('division') !== -1){
								$scope.location.stateProvince = response.name;
							}
							else if(t.toLowerCase().indexOf('district') !== -1){
								$scope.location.countyDistrict = response.name;
							}
							else if(t.toLowerCase().indexOf('upazilla') !== -1){
								$scope.location.cityVillage = response.name;
							}
							else if(t.toLowerCase().indexOf('union') !== -1){
								$scope.location.address3 = response.name;
							}
							else if(t.toLowerCase().indexOf('lab') !== -1){
								$scope.location.lab = response.name;
							}
						}

						$scope.loadingData = false;
					});
				}
				
				$scope.startInitForm = true;
			}
		}
	}
	
	$scope.submitForm = function(isValid) {
		if(!isValid){
			return;
		}
		
		if(!$scope.location.lab && $scope.user.roles.length > 0 && $scope.user.roles[0].display.toLowerCase().indexOf('lab tech') !== -1){
			alert('Lab technician MUST be mapped on a Lab');
			return;
		}
		
		console.log('Submitting edited User');
		
		/// reset selected role to remove all other fields except uuid
		selectedRole = {uuid: $scope.user.roles[0].uuid};
		$scope.user.roles[0] = selectedRole;
		
		userLocation = $scope.location.lab || $scope.location.address3 || $scope.location.cityVillage 
					|| $scope.location.countyDistrict || $scope.location.stateProvince;
		
		console.log($scope.attributes);
		
		$scope.user.person.gender="U";
		$scope.user.person.attributes.push({attributeType:$scope.attributes['email'].uuid, value: $scope.attributes.email.value});
		$scope.user.person.attributes.push({attributeType:$scope.attributes['designation'].uuid, value: $scope.attributes.designation.value});
		$scope.user.person.attributes.push({attributeType:$scope.attributes['organization'].uuid, value: $scope.attributes.organization.value});
		$scope.user.person.attributes.push({attributeType:$scope.attributes['primary contact number'].uuid, value: $scope.attributes['primary contact number'].value});
		
		if(userLocation){
			$scope.user.person.attributes.push({attributeType:$scope.attributes['health center'].uuid, value: userLocation});
		}
		
		console.debug($scope.user);
		
		UserService.saveUser($scope.user).then(function(res) {
				console.debug('User Submission result');
				console.debug(res);
				if(res.uuid){
					$state.go('user-list', {q: res.username});
				}
				else {
					alert('No uuid found in response. Contact program vendor');
				}
			},
			function(response) {
				console.debug('user');
				console.log(response);
				alert('Error saving user. '+response.data.error.message);
			});
	};
}]);