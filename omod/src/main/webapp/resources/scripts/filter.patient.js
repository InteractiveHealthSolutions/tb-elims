var patientFilterApp = angular.module('patient.filter',[]);

patientFilterApp.filter('attributeValue', function() {
	return function(attributeList, attribute) {
		for (var i = 0; i < attributeList.length; i++) {
			var item = attributeList[i];
			if (item.attributeType && attribute.toLowerCase() === item.attributeType.display.toLowerCase()) {
				return item.value;
			}
		}
		return 'n/a';
	};
})
.filter('getAttributeValue', function(attributeValueFilter) {
	return function(item, attribute) {
		if(item && item.person && item.person.attributes){
			attributeList = item.person.attributes;
			return attributeValueFilter(attributeList, attribute);
		}
		return 'n/a';
	};
})
.filter('identifierValue', function() {
	return function(identifierList, identifier) {
		for (var i = 0; i < identifierList.length; i++) {
			var item = identifierList[i];
			if (item.identifierType && identifier.toLowerCase() === item.identifierType.display.toLowerCase()) {
				return item.identifier;
			}
		}
		return 'n/a';
	};
})
.filter('getIdentifierValue', function(identifierValueFilter) {
	return function(item, identifier) {
		if(item && item.identifiers){
			identifierList = item.identifiers;
			return identifierValueFilter(identifierList, identifier);
		}
		return 'n/a';
	};
})
.filter('addressValue', function() {
	return function(addressList, field, value) {
		var res = {};
		for (var i = 0; i < addressList.length; i++) {
			var item = addressList[i];
			
			//if no filter on any field get first address
			if(!field || !value){
				res = item;
				break;
			}
			else if(item[field].toLowerCase() === value.toLowerCase()){
				res = item;
				break;
			}
		}
		var display = "";
		if(res.address1){
			display += res.address1+', ';
		}
		if(res.address3){
			display += res.address3+', ';
		}
		if(res.cityVillage){
			display += res.cityVillage+', ';
		}
		if(res.countyDistrict){
			display += res.countyDistrict+', ';
		}
		if(res.stateProvince){
			display += res.stateProvince;
		}
		
		return display;
	};
});