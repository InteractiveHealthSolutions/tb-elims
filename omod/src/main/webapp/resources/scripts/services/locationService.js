angular.module('locationService', ['ngResource', 'uicommons.common','location.filter'])
    .factory('LocationService', function($http,$filter) {
    	var tree;
    	var tagged = {};

  		var treeService = {    	    
  			getLocationTree: function() {
    	      // $http returns a promise, which has a then function, which also returns a promise
    	      return $http.get('/openmrs/data/rest/tbelims/location/tree.json').then(function (response) {
    	        // The then function here is an opportunity to modify the response
    	        console.log(response);
    	        // The return value gets picked up by the then in the controller.
    	        tree = JSON.parse(response.data.data);
    	        
    	        tags = ['division','district','upazilla','union'];
    	        
    	        for (var i = 0; i < tags.length; i++) {
        			var tag = tags[i];
        			tagged[tag+'s'] = treeService.fillLocationsForTag(tree,tag,true);
        		}
    	        console.log('treeeee');
    	        console.log(tree);

    	        return tree;
    	      });
    	    },
    	    getLocationsByTag: function(tag) {
				return tagged[tag]||tagged[tag+'s'];
			},
			getLocationAttribute: function(locations, location, attribute) {
				console.log(locations);
				console.log(location+':'+attribute);
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