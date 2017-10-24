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
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.criterion.MatchMode;
import org.joda.time.DateTime;
import org.openmrs.Location;
import org.openmrs.LocationAttribute;
import org.openmrs.LocationAttributeType;
import org.openmrs.api.context.Context;
import org.openmrs.module.tbelims.api.LocationDataService;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.openmrs.module.webservices.rest.SimpleObject;
import org.openmrs.module.webservices.rest.web.RequestContext;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.openmrs.module.webservices.rest.web.annotation.PropertyGetter;
import org.openmrs.module.webservices.rest.web.annotation.PropertySetter;
import org.openmrs.module.webservices.rest.web.annotation.Resource;
import org.openmrs.module.webservices.rest.web.representation.Representation;
import org.openmrs.module.webservices.rest.web.resource.impl.AlreadyPaged;
import org.openmrs.module.webservices.rest.web.resource.impl.DelegatingResourceDescription;
import org.openmrs.module.webservices.rest.web.response.ResourceDoesNotSupportOperationException;
import org.openmrs.module.webservices.rest.web.response.ResponseException;
import org.openmrs.module.webservices.rest.web.v1_0.resource.openmrs1_9.LocationResource1_9;

@Resource(name = RestConstants.VERSION_1 + "/labdata", supportedClass = Location.class, supportedOpenmrsVersions = {
        "1.11.*", "1.12.*", "2.0.*", "2.1.*" })
public class LabDataResource extends LocationResource1_9 {
	
	Log log = LogFactory.getLog(this.getClass());
	
	@Override
	public DelegatingResourceDescription getRepresentationDescription(Representation rep) {
		DelegatingResourceDescription repres = super.getRepresentationDescription(rep);
		repres.addProperty("identifier");
		repres.addProperty("labType");
		repres.addProperty("organizationType");
		repres.addProperty("organizationName");
		repres.addProperty("registrationDate");
		return repres;
	}
	
	@Override
	public Location save(Location location) {
		// should skip validation incase of update of resource
		if(location.getLocationId() == null && Context.getLocationService().getLocation(location.getName()) != null){
			throw new ResourceDoesNotSupportOperationException("A location with given name already exists");
		}
		LocationAttribute id = getAttribute(location, "identifier");
		
		// replace the remaining id digits with current count+1 otherwise assume identifier was preset
		if(id.getValue().toString().endsWith("xxx") || id.getValue().toString().endsWith("***")){
			String identifier = id.getValue().toString().replace("-xxx", "").replace("xxx", "").replace("-***", "").replace("***", "");
			
			Map<String, Object> attributes = new HashMap<>();
			attributes.put("Identifier", identifier);
			long currentCountPlus = 1+Context.getService(LocationDataService.class).countLocations(null, null, attributes, MatchMode.START);
			
			identifier = identifier + StringUtils.leftPad(currentCountPlus+"", 3, "0");
			
			id.setValue(identifier);
		}
		
		location.addTag(Context.getLocationService().getLocationTagByName("Lab"));
		
		log.info(location);
		
		return super.save(location);
	}
	
	@Override
	public DelegatingResourceDescription getCreatableProperties() {
		DelegatingResourceDescription cp = super.getCreatableProperties();
		cp.addRequiredProperty("identifier");
		cp.addRequiredProperty("labType");
		cp.addRequiredProperty("organizationType");
		cp.addRequiredProperty("organizationName");
		cp.addRequiredProperty("registrationDate");
		
		return cp;
	}
	
	@Override
	public DelegatingResourceDescription getUpdatableProperties() {
		DelegatingResourceDescription cp = super.getUpdatableProperties();
		cp.addRequiredProperty("labType");
		cp.addRequiredProperty("organizationType");
		cp.addRequiredProperty("organizationName");
		cp.addRequiredProperty("registrationDate");
		
		return cp;
	}
	
	private PaginationHandler pagination = new PaginationHandler() {};
	
	@Override
	protected AlreadyPaged<Location> doSearch(RequestContext context) {
		log.info("Searching labs");
		
		String query = getStringFilter("q", context);
        String parent = getStringFilter("parent", context);
        String labType = getStringFilter("labType", context);
        String organizationType = getStringFilter("organizationType", context);
        
        Map<String, Object> attributes = new HashMap<>();
        
        List<String> tags = Arrays.asList("Lab".split(","));
        
        if(StringUtils.isNotBlank(labType)){
        	attributes.put("Location Type", labType);
        }
        
        if(StringUtils.isNotBlank(organizationType)){
        	attributes.put("Organization Type", organizationType);
        }
        
        Date dateFrom = null;
        Date dateTo = null;
		try {
			dateFrom = getDateFilter("dateFrom", context);
			dateTo = getDateFilter("dateTo", context);
		} catch (ParseException e) {
			throw new ResourceDoesNotSupportOperationException("Invalid date format. Acceptable format is "+GLOBAL_JAVA_DATE_FORMAT.toPattern());
		}

        Integer start = getIntegerFilter("start", context);
        Integer limit = getIntegerFilter("limit", context);
        
        pagination.limit(limit==null?20:limit);
        pagination.start(start==null?0:start);
        
		List<Location> results = Context.getService(LocationDataService.class).findLocations(query, parent, tags, attributes, dateFrom, dateTo, pagination);
		return new AlreadyPaged<>(context, results, results.size()<pagination.totalRows(), pagination.totalRows());
	}
	
	@PropertyGetter("identifier")
	public String getIdentifier(Location location) {
		// Ideally should never be null / voided
		for (LocationAttribute attribute : location.getActiveAttributes()) {
			if (attribute.getAttributeType().getName().toLowerCase().contains("identifier")) {
				return attribute.getValue().toString();
			}
		}
		return null;
	}
	
	@PropertyGetter("labType")
	public String getLabType(Location location) {
		// Ideally should never be null / voided
		for (LocationAttribute attribute : location.getActiveAttributes()) {
			if (attribute.getAttributeType().getName().toLowerCase().matches("location.*type")) {
				return attribute.getValue().toString();
			}
		}
		return null;
	}
	
	@PropertyGetter("organizationType")
	public String getOrganizationType(Location location) {
		// Ideally should never be null / voided
		for (LocationAttribute attribute : location.getActiveAttributes()) {
			if (attribute.getAttributeType().getName().toLowerCase().matches("organization.*type")) {
				return attribute.getValue().toString();
			}
		}
		return null;
	}
	
	@PropertyGetter("organizationName")
	public String getOrganizationName(Location location) {
		// Ideally should never be null / voided
		for (LocationAttribute attribute : location.getActiveAttributes()) {
			if (attribute.getAttributeType().getName().toLowerCase().matches("organization.*name")) {
				return attribute.getValue().toString();
			}
		}
		return null;
	}
	
	@PropertyGetter("registrationDate")
	public Date getRegistrationDate(Location location) {
		// Ideally should never be null / voided
		for (LocationAttribute attribute : location.getActiveAttributes()) {
			if (attribute.getAttributeType().getName().toLowerCase().matches("registration.*date")) {
				return (Date) attribute.getValue();
			}
		}
		return null;
	}
	
	@PropertySetter("identifier")
	public void setIdentifier(Location location, String identifier) {
		setAttribute(location, "Identifier", identifier);
	}
	
	@PropertySetter("labType")
	public void setLabType(Location location, String labType) {
		setAttribute(location, "Location Type", labType);
	}
	
	@PropertySetter("organizationType")
	public void setOrganizationType(Location location, String organizationType) {
		setAttribute(location, "Organization Type", organizationType);
	}
	
	@PropertySetter("organizationName")
	public void setOrganizationName(Location location, String organizationName) {
		setAttribute(location, "Organization Name", organizationName);
	}
	
	@PropertySetter("registrationDate")
	public void setRegistrationDate(Location location, String registrationDate) {
		if (StringUtils.isNotBlank(registrationDate)) {
			setAttribute(location, "Registration Date", DateTime.parse(registrationDate).toDate());
		}
	}
	
	private void setAttribute(Location location, String attributeType, Object value) {
		LocationAttribute attribute = getAttribute(location, attributeType);
		
		if (attribute == null) {
			LocationAttributeType attributeT = Context.getLocationService().getLocationAttributeTypeByName(attributeType);
			
			if (attributeT == null) {
				throw new ResourceDoesNotSupportOperationException("No attribute type '" + attributeType + "' found");
			}
			
			attribute = new LocationAttribute();
			attribute.setAttributeType(attributeT);
		}
		
		attribute.setValue(value);
		
		location.addAttribute(attribute);
	}
	
	private LocationAttribute getAttribute(Location location, String attribute) {
		for (LocationAttribute att : location.getActiveAttributes()) {
			if (att.getAttributeType().getName().toLowerCase().equalsIgnoreCase(attribute)) {
				return att;
			}
		}
		return null;
	}
	
}
