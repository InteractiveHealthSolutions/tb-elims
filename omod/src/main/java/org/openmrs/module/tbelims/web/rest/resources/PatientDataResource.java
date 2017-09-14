package org.openmrs.module.tbelims.web.rest.resources;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.openmrs.Patient;
import org.openmrs.PersonAddress;
import org.openmrs.api.context.Context;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.openmrs.module.tbelims.api.PatientDataService;
import org.openmrs.module.webservices.rest.web.RequestContext;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.openmrs.module.webservices.rest.web.annotation.Resource;
import org.openmrs.module.webservices.rest.web.resource.api.PageableResult;
import org.openmrs.module.webservices.rest.web.resource.impl.AlreadyPaged;
import org.openmrs.module.webservices.rest.web.v1_0.resource.openmrs1_9.PatientResource1_9;
import static org.openmrs.module.tbelims.WebUtils.*;

@Resource(name = RestConstants.VERSION_1 + "/patientdata", supportedClass = Patient.class, supportedOpenmrsVersions = {
        "1.11.*", "1.12.*", "2.0.*", "2.1.*" })
public class PatientDataResource extends PatientResource1_9 {
	
	private PaginationHandler pagination = new PaginationHandler() {};
	
	@Override
	protected AlreadyPaged<Patient> doSearch(RequestContext context) {
		Logger.getLogger(getClass()).info("I AM LOGGING THIS");
		
		String query = getStringFilter("q", context);
        String gender = getStringFilter("gender", context);
        Integer age = getIntegerFilter("age", context);
        String stateProvince = getStringFilter("stateProvince", context);
        String countyDistrict = getStringFilter("countyDistrict", context);
        String cityVillage = getStringFilter("cityVillage", context);
        String union = getStringFilter("union", context);
        
        Integer start = getIntegerFilter("start", context);
        Integer limit = getIntegerFilter("limit", context);
        
        pagination.limit(limit==null?20:limit);
        pagination.start(start==null?0:limit);
        
        PersonAddress address = null;
		
		if (StringUtils.isNotBlank(stateProvince) || StringUtils.isNotBlank(countyDistrict)
		        || StringUtils.isNotBlank(cityVillage) || StringUtils.isNotBlank(union)) {
			address = new PersonAddress();
			address.setStateProvince(stateProvince);
			address.setCountyDistrict(countyDistrict);
			address.setCityVillage(cityVillage);
			address.setAddress3(union);
		}
		
		List<Patient> results = Context.getService(PatientDataService.class).findPatients(query, gender, 
				age, age, address, pagination);
		return new AlreadyPaged<>(context, results, results.size()<pagination.totalRows(), pagination.totalRows());
	}
}
