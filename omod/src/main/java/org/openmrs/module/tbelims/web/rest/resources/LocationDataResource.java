package org.openmrs.module.tbelims.web.rest.resources;

import static org.openmrs.module.tbelims.WebUtils.GLOBAL_JAVA_DATE_FORMAT;
import static org.openmrs.module.tbelims.WebUtils.getDateFilter;
import static org.openmrs.module.tbelims.WebUtils.getIntegerFilter;
import static org.openmrs.module.tbelims.WebUtils.getStringFilter;

import java.text.ParseException;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.openmrs.Location;
import org.openmrs.api.context.Context;
import org.openmrs.module.tbelims.api.LocationDataService;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.openmrs.module.webservices.rest.web.RequestContext;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.openmrs.module.webservices.rest.web.annotation.Resource;
import org.openmrs.module.webservices.rest.web.representation.DefaultRepresentation;
import org.openmrs.module.webservices.rest.web.representation.FullRepresentation;
import org.openmrs.module.webservices.rest.web.representation.Representation;
import org.openmrs.module.webservices.rest.web.resource.impl.AlreadyPaged;
import org.openmrs.module.webservices.rest.web.resource.impl.DelegatingResourceDescription;
import org.openmrs.module.webservices.rest.web.response.ResourceDoesNotSupportOperationException;
import org.openmrs.module.webservices.rest.web.v1_0.resource.openmrs1_9.LocationResource1_9;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Resource(name = RestConstants.VERSION_1 + "/locationdata", supportedClass = Location.class, supportedOpenmrsVersions = {
        "1.11.*", "1.12.*", "2.0.*", "2.1.*" })
public class LocationDataResource extends LocationResource1_9 {
	
	@Override
	public DelegatingResourceDescription getRepresentationDescription(Representation rep) {
		if (rep instanceof DefaultRepresentation) {
			DelegatingResourceDescription description = new DelegatingResourceDescription();
			description.addProperty("uuid");
			description.addProperty("display");
			description.addProperty("name");
			description.addProperty("cityVillage");
			description.addProperty("stateProvince");
			description.addProperty("country");
			description.addProperty("latitude");
			description.addProperty("longitude");
			description.addProperty("countyDistrict");
			description.addProperty("address3");
			description.addProperty("address4");
			description.addProperty("address5");
			description.addProperty("address6");
			description.addProperty("tags", Representation.REF);
			description.addProperty("parentLocation", Representation.REF);
			description.addProperty("retired");
			description.addProperty("attributes", Representation.DEFAULT);
			return description;
		}
		
		return super.getRepresentationDescription(rep);
	}
	
	private PaginationHandler pagination = new PaginationHandler() {};
	
	@Override
	protected AlreadyPaged<Location> doSearch(RequestContext context) {
		Logger.getLogger(getClass()).info("Searching locations");
		
		String query = getStringFilter("q", context);
        String parent = getStringFilter("parent", context);
        String tagsStr = getStringFilter("tags", context);
        String attributesStr = getStringFilter("attributes", context);
        Date dateFrom = null;
        Date dateTo = null;
		try {
			dateFrom = getDateFilter("dateFrom", context);
			dateTo = getDateFilter("dateTo", context);
		} catch (ParseException e) {
			throw new ResourceDoesNotSupportOperationException("Invalid date format. Acceptable format is "+GLOBAL_JAVA_DATE_FORMAT.toPattern());
		}
		
        List<String> tags = null;
        Map<String, Object> attributes = null;
        
        if(StringUtils.isNotBlank(tagsStr)){
        	tags = Arrays.asList(tagsStr.split(","));
        }
        
        if(StringUtils.isNotBlank(attributesStr)){
        	try {
				attributes = new ObjectMapper().readValue(attributesStr, new TypeReference<Map<String, Object>>() {});
			} catch (Exception e) {
				e.printStackTrace();
			}
        }

        Integer start = getIntegerFilter("start", context);
        Integer limit = getIntegerFilter("limit", context);
        
        pagination.limit(limit==null?20:limit);
        pagination.start(start==null?0:start);
        
		List<Location> results = Context.getService(LocationDataService.class).findLocations(query, parent, tags, attributes, dateFrom, dateTo, pagination);
		return new AlreadyPaged<>(context, results, results.size()<pagination.totalRows(), pagination.totalRows());
	}
}
