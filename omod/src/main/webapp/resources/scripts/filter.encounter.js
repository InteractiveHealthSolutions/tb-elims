var encounterFilterApp = angular.module('encounter.filter',[]);

encounterFilterApp.filter('obsValue', function() {
	return function(obsList, concept) {
		for (var i = 0; i < obsList.length; i++) {
			var item = obsList[i];
			
			if (item.concept.display.toLowerCase() === concept.toLowerCase() || item.concept.uuid.toLowerCase() === concept.toLowerCase()){
				// remove concept name from obs value and return string representation
				return item.display.replace(item.concept.display+':', '');
			}
		}
		return '-';
	};
})
.filter('getObsValue', function(obsValueFilter) {
	return function(encounterList, concept, encounter) {
		console.debug('obs list');
		console.debug(encounterList);

		obsList = [];
		
		for (var i = 0; i < encounterList.length; i++) {
			var item = encounterList[i];
			
			if(encounter){ // match encounter too otherwise just find an obs in any of the encounters
				if (item.encounterType.name.toLowerCase() === encounter.toLowerCase()){
					obsList = item.obs;
				}
			}
			else {// push all obs in this to be traversed later for given concept
				obsList.concat(item.obs);
			}
		}
		return obsValueFilter(obsList, concept);
	};
});