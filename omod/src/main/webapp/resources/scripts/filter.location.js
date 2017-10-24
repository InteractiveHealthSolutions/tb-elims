var locationFilterApp = angular.module('location.filter',[]);

locationFilterApp.filter('attributeValue', function() {
	return function(attributeList, attribute) {
		console.debug(attributeList);
		console.debug(attribute);
		for (var i = 0; i < attributeList.length; i++) {
			var item = attributeList[i];
			if (item.name && attribute.toLowerCase() === item.name.toLowerCase()) {
				return item.value;
			}
		}
		return 'n/a';
	};
})
.filter('getAttributeValue', function(attributeValueFilter) {
	return function(item, attribute) {
		if(item && item.attributes){
			attributeList = item.attributes;
			return attributeValueFilter(attributeList, attribute);
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