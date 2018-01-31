package org.openmrs.module.tbelims.web.rest.resources;

import static org.openmrs.module.tbelims.WebUtils.GLOBAL_JAVA_DATE_FORMAT;
import static org.openmrs.module.tbelims.WebUtils.getDateFilter;
import static org.openmrs.module.tbelims.WebUtils.getIntegerFilter;
import static org.openmrs.module.tbelims.WebUtils.getStringFilter;

import java.text.ParseException;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.openmrs.ConceptName;
import org.openmrs.Encounter;
import org.openmrs.Obs;
import org.openmrs.PersonAddress;
import org.openmrs.api.context.Context;
import org.openmrs.module.tbelims.api.EncounterDataService;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.openmrs.module.webservices.rest.SimpleObject;
import org.openmrs.module.webservices.rest.web.RequestContext;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.openmrs.module.webservices.rest.web.annotation.PropertyGetter;
import org.openmrs.module.webservices.rest.web.annotation.Resource;
import org.openmrs.module.webservices.rest.web.representation.Representation;
import org.openmrs.module.webservices.rest.web.resource.impl.AlreadyPaged;
import org.openmrs.module.webservices.rest.web.resource.impl.DelegatingResourceDescription;
import org.openmrs.module.webservices.rest.web.response.ResourceDoesNotSupportOperationException;
import org.openmrs.module.webservices.rest.web.v1_0.resource.openmrs1_9.EncounterResource1_9;

@Resource(name = RestConstants.VERSION_1 + "/encounterdata", supportedClass = Encounter.class, supportedOpenmrsVersions = {
        "1.11.*", "1.12.*", "2.0.*", "2.1.*" })
public class EncounterDataResource extends EncounterResource1_9 {
	
	@Override
	public DelegatingResourceDescription getRepresentationDescription(Representation rep) {
		DelegatingResourceDescription repr = super.getRepresentationDescription(rep);
		repr.addProperty("conceptMap");
		
		return repr;
	}
	
	private PaginationHandler pagination = new PaginationHandler() {};
	
	@Override
	protected AlreadyPaged<Encounter> doSearch(RequestContext context) {
		String patient = getStringFilter("patient", context);
        String location = getStringFilter("location", context);
        String encounterTypeStr = getStringFilter("encounterTypes", context);
        List<String> encounterTypes = null;
        if(encounterTypeStr != null){
        	encounterTypes = Arrays.asList(encounterTypeStr.split(","));
        }
        
        String stateProvince = getStringFilter("stateProvince", context);
        String countyDistrict = getStringFilter("countyDistrict", context);
        String cityVillage = getStringFilter("cityVillage", context);
        
        Date dateFrom = null;
        Date dateTo = null;
		try {
			dateFrom = getDateFilter("dateFrom", context);
			dateTo = getDateFilter("dateTo", context);
		} catch (ParseException e) {
			throw new ResourceDoesNotSupportOperationException("Invalid date format. Acceptable format is "+GLOBAL_JAVA_DATE_FORMAT.toPattern());
		}
		
		PersonAddress address = null;
		
		if (StringUtils.isNotBlank(stateProvince) || StringUtils.isNotBlank(countyDistrict)
		        || StringUtils.isNotBlank(cityVillage)) {
			address = new PersonAddress();
			address.setStateProvince(stateProvince);
			address.setCountyDistrict(countyDistrict);
			address.setCityVillage(cityVillage);
		}
        
        Integer start = getIntegerFilter("start", context);
        Integer limit = getIntegerFilter("limit", context);
        
        pagination.limit(limit==null?20:limit);
        pagination.start(start==null?0:start);
        
		List<Encounter> results = Context.getService(EncounterDataService.class).findEncounters(patient, location, 
				encounterTypes, address, dateFrom, dateTo, pagination);
		return new AlreadyPaged<>(context, results, results.size()<pagination.totalRows(), pagination.totalRows());
	}
	
	@PropertyGetter("conceptMap")
	public Map<String, Object> obsConceptMap(Encounter e) {
		try {
			Map<String, Object> map = new HashMap<>();
			System.out.println("Looooooooooooooooooking it");
			System.out.println(e.getAllObs());
			
			for (Obs o : e.getAllObs()) {
				ConceptName cn = o.getConcept().getName();
				
				SimpleObject c = new SimpleObject();
				c.add("uuid", o.getConcept().getUuid());
				c.add("display", cn == null ? null : cn.getName());
				map.put(o.getUuid(), c);
			}
			return map;
		}
		catch (Exception ex) {
			ex.printStackTrace();
		}
		return null;
	}
}
