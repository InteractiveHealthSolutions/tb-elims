var roleApp = angular.module('app.role',['roleService','privilegeService','ui.grid','ui.grid.pagination',
              'ui.grid.autoResize', 'ui.tree']);

roleApp.controller('RoleListController', ['$scope', '$filter', '$state', '$uibModal','uiGridConstants', 'RoleService',
    function($scope, $filter, $state, $uibModal, uiGridConstants, RoleService) {

	var paginationOptions = {
	    pageNumber:1,
	    pageSize: 100,
	};
	
	// Initializing data grid default options
	$scope.rolesList = {
        enableSorting: false,
        enableColumnMenus: false,
        rowHeight:35,
        paginationPageSizes: [5, 20, 40, 60, 100],
        paginationPageSize: paginationOptions.pageSize,
        useExternalPagination: false, 
        columnDefs: [
          { name:'Name', width: '35%', field: 'name' },
          { name:'Delete', width: '15%', field: 'uuid', cellTemplate: 'delete-profile-button.html'}
          ],
        data: [],
        onRegisterApi: function (gridApi) {      
        	// make grid adapt to height according to page size or resultset
            gridApi.core.on.rowsRendered(null, function(gridApi) {
            	resetGridHeight($scope.rolesList, $scope);
			});
            
            $scope.loadRoles();
        }
	};
	
	$scope.loadRoles = function() {
		RoleService.getRoles().then(function(response) {
			console.debug('roles');
			console.debug(response);
			if (response) {
				resArr = [];
				for (var i = 0; i < response.results.length; i++) {
					var arrElem = response.results[i];
					if(arrElem.description && arrElem.description.toLowerCase().indexOf('elims') !== -1 
							&& /^(Anonymous|Authenticated|Privilege Level.*Full|Provider|System Developer)$/i.test(arrElem.name) == false){
						resArr.push(arrElem);
					}
				}
				$scope.rolesList.data = resArr;
				$scope.rolesList.totalItems = response.totalCount;
			}
		},
		function(response) {
			//TODO handle this error and show to user
			console.debug('roles error');
			console.log(response);
		});
	};
	
	$scope.newRoleModal = function() {
		role = {};
		
		modalInstance = $uibModal.open({
			ariaLabelledBy: 'modal-title-top',
			ariaDescribedBy: 'modal-body-top',
			templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/role-registration.html',
			windowClass: 'popup',
			controller: function($scope, role) {
		    	console.debug('role');
		    	console.debug(role);
			    $scope.role = role;
			    $scope.submitForm = function() {
			    	// each role should have Privilege Level: REST GET METADATA by default
			    	role['inheritedRoles']=["f7fa221a-fe55-498d-ad00-377af5555555"];
			        console.debug('i m ok');
			        RoleService.saveRole(role).then(function(res) {
						console.debug('Role Submission result');
						console.debug(res);
						if(res.uuid){
							$state.go($state.current, {}, {reload: true});
							modalInstance.close();
						}
						else {
							alert('No uuid found in response. Contact program vendor');
						}
					},
					function(response) {
						console.debug('role submission error');
						console.log(response);
						alert('Error saving role. Make sure that Role name is unique and all required properties are specified');
					});
			    };
		        $scope.cancel = function() {
		            modalInstance.close();
		        };
		      },
		      resolve: {
		    	  role: function () {
                      return role;
                  }
              }
        });
	};
	
	$scope.deleteRoleModal = function(currentRole) {
		role = currentRole;
		
		modalInstance = $uibModal.open({
			ariaLabelledBy: 'modal-title-top',
			ariaDescribedBy: 'modal-body-top',
			templateUrl: '/openmrs/ms/uiframework/resource/tbelims/html/role-void.html',
			windowClass: 'popup',
			controller: function($scope, role) {
		    	$scope.role = role;

			    $scope.submitForm = function() {
			    	$scope.error = false;
			    	
			        console.debug('deleting role');
			        RoleService.voidRole(role.uuid).then(function(res) {
						console.debug('Role Submission result');
						console.debug(res);
						$state.go($state.current, {}, {reload: true});
						
			            modalInstance.close();
					},
					function(response) {
						console.debug('role submission error');
						console.log(response);
						$scope.error = true;
					});
			    };
		        $scope.cancel = function() {
		            modalInstance.close();
		        };
		      },
		      resolve: {
		    	  role: function () {
                      return role;
                  }
              }
        });
	};
	
	$scope.doRoleRegistration = function() {
		$scope.newRoleModal();
	}
	$scope.delete = function(currentRole) {
		$scope.deleteRoleModal(currentRole);
	}
}]);

roleApp.controller('UserAccessControlController', ['$scope', '$filter', '$state', '$uibModal', 'uiGridConstants', 'RoleService', 'PrivilegeService',
    function($scope, $filter, $state, $uibModal, uiGridConstants, RoleService, PrivilegeService) {
	
	$scope.privileges = [];
	$scope.roles = [];
	$scope.roleMap = {};
	$scope.progressMessage = "";
	// after successfully loading roles and permissions this should be flagged to render the UI
	// doing without it throws an overflow
	$scope.loadComplete = true;
	
	$scope.loadMetadata = function(){
		PrivilegeService.loadPrivileges($scope, 'privileges', 'elims');
		
		RoleService.loadRolePrivilegeMap($scope, 'roles', 'privilegeMap', /^(Anonymous|Authenticated|Privilege Level.*Full|Provider|System Developer)$/i);
	}
	
	$scope.submitForm = function() {
		$scope.progressMessage = "Submitting roles .. ";
		
		console.log($scope.roles);
		
		for (var i = 0; i < $scope.roles.length; i++) {
			var rol = $scope.roles[i];

			$scope.progressMessage += "Saving "+rol.name;
			
			rm = $scope.roles[rol.name];
			prmMap = rm.privilegeMap;
			pArr = [];

			for ( var prm in prmMap ) {
				if(!prmMap[prm]){
					// prmMap.delete(prm);
				}
				else{
					pArr.push(prm);
				}
			}
			
			RoleService.editRole({uuid:rol.uuid,name:rol.name,privileges:pArr}).then(function(res) {
				console.debug('Role edit result');
				console.debug(res);
				if(res.uuid){
					$scope.progressMessage += "\nSaved "+rol.name;
				}
				else {
					$scope.progressMessage += "\nError: No uuid found in response for "+rol.name;
				}
				
				if(i == $scope.roles.length-1){
					$scope.progressMessage += "\nFinished saving data ";
					$state.go($state.current, {}, {reload: true});
				}
			},
			function(response) {
				console.debug('role submission error');
				console.log(response);
				$scope.progressMessage += "\nError saving role "+rol.name+". "+ response;
			});
		}
	}
}]);
