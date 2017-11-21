angular.module('locationService', ['ngResource', 'uicommons.common','location.filter'])
.factory('Location', function($resource) {
    return $resource("/" + OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/locationdata/:uuid?v=full", {
        uuid: '@uuid'
    },{
        query: { method:'GET', isArray:false } // OpenMRS RESTWS returns { "results": [] }
    });
})
.factory('Lab', function($resource) {
    return $resource("/" + OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/labdata/:uuid?v=full", {
        uuid: '@uuid'
    },{
        query: { method:'GET', isArray:false } // OpenMRS RESTWS returns { "results": [] }
    });
})
.factory('LocationService', function($http,$filter,Location,Lab) {
	var tree;
	var tagged = {};

	var treeService = {    	
		getLocation: function(id) {
    		return Location.get({uuid: id}).$promise.then(function (response) {
    	        return response;
    	    });
		},
		getLocationTree: function() {
	      // $http returns a promise, which has a then function, which also returns a promise
	      return $http.get('/openmrs/data/rest/tbelims/location/tree.json').then(function (response) {
	        // The then function here is an opportunity to modify the response
	        console.log(response);
	        // The return value gets picked up by the then in the controller.
	        return tree = JSON.parse(response.data.data);
	      });
	    },
	    getLocationsByTag: function(tag, local, nolimit) {
	    	tag = tag.toLowerCase();
	    	
	    	// if local=true and locations not exist load from server otherwise use local. 
	    	if(!local || !tagged[tag]){
	    		params = {tags: tag};
	    		if(nolimit){
	    			params['limit'] = 99999;
	    		}
	    		return Location.query(params).$promise.then(function (response) {
	    	        console.log(tag);
	    	        console.log(response);

	    			tagged[tag] = response.results;
	    	        return tagged[tag];
	    	    });
	    	}
			return new Promise(function(resolve, reject) {
				resolve(tagged[tag]);
			});
		},
		loadLocationsByTag: function(tag, scope, key) {
	    	tag = tag.toLowerCase();
	    	
	    	scope[key] = tagged[tag];
		},
		loadChildLocations: function(parent, tag, scope, key, flag) {
			if(parent){
				if(flag){
					scope[flag] = true;
				}

				params = {parent: parent};
    			params['limit'] = 99999;
				if(tag){
					params['tags'] = tag;
				}
				Location.query(params).$promise.then(function(response) {
					scope[key] = response.results;

					if(flag){
						scope[flag] = false;
					}
				});
			}
		},
		getLocations: function(params, nolimit) {
	    	// if local=true and locations not exist load from server otherwise use local. 
    		if(nolimit){
    			params['limit'] = 99999;
    		}
    		return Location.query(params).$promise.then(function (response) {
    	        console.debug(response);

    	        return response.results;
    	    });
		},
		getLocationAttribute: function(locations, location, attribute) {
			console.debug(location+':'+attribute);
			if(!locations || !location || !attribute || !locations.length || locations.length === 0){
				return "";
			}
			
			for (var i = 0; i < locations.length; i++) {
				var loc = locations[i];
				if(loc.name.toLowerCase() === location.toLowerCase()){
					return $filter("attributeValue")(loc.attributes, attribute)
				}
			}
			return "";
		},
		getLab: function(uid) {
    		return Lab.get({uuid: uid}).$promise.then(function(res) {
                return res;
            });
		},
        getLabs: function(params) {
        	params['totalCount'] = true;
            return Lab.query(params).$promise.then(function(res) {
                return res;
            });
        },
        saveLab: function(lab) {
            return Lab.save(lab).$promise.then(function(res) {
                return res;
            });
        },
        editLab: function(lab) {
			return Lab.save({uuid: lab.uuid}, lab).$promise.then(function(res) {
                return res;
            });
		},
		voidLab: function(uuid, reason) {
			return Lab.delete({uuid: uuid, reason: reason}).$promise.then(function(res) {
                return res;
            });
		},
		fillLocationsForTag: function(locationList, tag, hierarchicalTagging) {
			if(!locationList.length) return [];
			
			var resultLocations = treeService.fillLocations(tag, hierarchicalTagging, locationList, resultLocations);
			//console.debug('resultLocations');
			//console.debug(resultLocations);
			return resultLocations;
		},
		fillLocations: function(tag, hierarchicalTagging, searchableLocations, resultLocations) {
			if(!resultLocations){
				resultLocations = [];
			}
			
			for (var i = 0; i < searchableLocations.length; i++) {
				var loc = searchableLocations[i];
				
				var matched = false;
				if(loc.tags){
					for (var k = 0; k < loc.tags.length; k++) {
						var locTag = loc.tags[k];
						if(locTag.name.toLowerCase().indexOf(tag.toLowerCase()) !== -1){
							resultLocations.push(loc);
							matched = true;
							break;
						}
					}
				}
				//if tagging is hierarchical then stop digging children when location of given tag is found
				if(!(hierarchicalTagging && matched) && loc.children && loc.children.length > 0){
					treeService.fillLocations(tag, hierarchicalTagging, loc.children, resultLocations);
				}
			}
			return resultLocations;
		}
	};
	return treeService;
});