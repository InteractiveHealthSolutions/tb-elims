package org.openmrs.module.tbelims.web.rest.resources;

import static org.openmrs.module.tbelims.WebUtils.GLOBAL_JAVA_DATE_FORMAT;
import static org.openmrs.module.tbelims.WebUtils.getDateFilter;
import static org.openmrs.module.tbelims.WebUtils.getIntegerFilter;
import static org.openmrs.module.tbelims.WebUtils.getStringFilter;

import java.lang.reflect.Method;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openmrs.Location;
import org.openmrs.Person;
import org.openmrs.PersonAttribute;
import org.openmrs.PersonAttributeType;
import org.openmrs.Provider;
import org.openmrs.User;
import org.openmrs.api.context.Context;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.openmrs.module.tbelims.api.UserDataService;
import org.openmrs.module.webservices.rest.web.RequestContext;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.openmrs.module.webservices.rest.web.annotation.PropertyGetter;
import org.openmrs.module.webservices.rest.web.annotation.PropertySetter;
import org.openmrs.module.webservices.rest.web.annotation.Resource;
import org.openmrs.module.webservices.rest.web.representation.Representation;
import org.openmrs.module.webservices.rest.web.resource.impl.DelegatingResourceDescription;
import org.openmrs.module.webservices.rest.web.resource.impl.NeedsPaging;
import org.openmrs.module.webservices.rest.web.response.ResourceDoesNotSupportOperationException;
import org.openmrs.module.webservices.rest.web.v1_0.resource.openmrs1_11.PersonResource1_11;
import org.openmrs.module.webservices.rest.web.v1_0.resource.openmrs1_8.UserResource1_8;
import org.openmrs.module.webservices.rest.web.v1_0.resource.openmrs2_0.UserResource2_0;
import org.openmrs.module.webservices.rest.web.v1_0.wrapper.openmrs1_8.UserAndPassword1_8;
import org.openmrs.util.OpenmrsUtil;

@Resource(name = RestConstants.VERSION_1 + "/userdata", supportedClass = UserAndPassword1_8.class, supportedOpenmrsVersions = {
        "1.11.*", "1.12.*", "2.0.*", "2.1.*" })
public class UserDataResource extends UserResource1_8 {
	
	Log log = LogFactory.getLog(this.getClass());
	
	@Override
	public DelegatingResourceDescription getRepresentationDescription(Representation rep) {
		DelegatingResourceDescription repres = super.getRepresentationDescription(rep);
		repres.addProperty("provider", Representation.FULL);
		repres.addProperty("location", Representation.FULL);
		repres.removeProperty("secretQuestion");
		repres.addProperty("person", Representation.FULL);
		
		return repres;
	}
	
	/**
	 * @see org.openmrs.module.webservices.rest.web.resource.impl.DelegatingCrudResource#save(java.lang.Object)
	 */
	@Override
	public UserAndPassword1_8 save(UserAndPassword1_8 user) {
		User openmrsUser = user.getUser();
		
		boolean saveExists = false;
		try {
			for (Method method : Context.getUserService().getClass().getDeclaredMethods()) {
				if (method.getName().equals("saveUser")) {
					saveExists = true;
					log.info("Method saveUser exists.");
				}
			}
		}
		catch (Exception e) {
			e.printStackTrace();
		}
		
		if (user.getUser().getUserId() == null) {
			openmrsUser = Context.getUserService().createUser(user.getUser(), user.getPassword());
			
			Provider prov = new Provider();
			prov.setPerson(user.getUser().getPerson());
			prov.setName(user.getUser().getPersonName().getFullName());
			prov.setIdentifier(user.getUser().getUsername());
			
			Context.getProviderService().saveProvider(prov);
		} else {
			Context.getUserService().updateUser(user.getUser());//TODO
			Context.refreshAuthenticatedUser();
		}
		
		return new UserAndPassword1_8(openmrsUser);
		
	}
	
	private PaginationHandler pagination = new PaginationHandler() {};
	
	public UserAndPassword1_8 getByUniqueId(String uuid) {
		User user = Context.getUserService().getUserByUuid(uuid);
		if (user == null) {
			user = Context.getUserService().getUserByUsername(uuid);
		}
		
		Person person = null;
		if (user == null && (person = Context.getPersonService().getPersonByUuid(uuid)) != null) {
			List<User> userlist = Context.getUserService().getUsersByPerson(person, false);
			if (userlist.size() > 0) {
				user = userlist.get(0);
			}
		}
		return new UserAndPassword1_8(user);
	}
	
	@Override
	protected NeedsPaging<UserAndPassword1_8> doSearch(RequestContext context) {
		log.info("Searching users");
		
		String query = getStringFilter("q", context);
		String role = getStringFilter("role", context);
		
		String stateProvince = getStringFilter("stateProvince", context);
		String countyDistrict = getStringFilter("countyDistrict", context);
		String cityVillage = getStringFilter("cityVillage", context);
		
		Date dateFrom = null;
		Date dateTo = null;
		try {
			dateFrom = getDateFilter("dateFrom", context);
			dateTo = getDateFilter("dateTo", context);
		}
		catch (ParseException e) {
			throw new ResourceDoesNotSupportOperationException("Invalid date format. Acceptable format is "
			        + GLOBAL_JAVA_DATE_FORMAT.toPattern());
		}
		
		Location address = null;
		
		if (StringUtils.isNotBlank(stateProvince) || StringUtils.isNotBlank(countyDistrict)
		        || StringUtils.isNotBlank(cityVillage)) {
			address = new Location();
			address.setStateProvince(stateProvince);
			address.setCountyDistrict(countyDistrict);
			address.setCityVillage(cityVillage);
		}
		
		Integer start = getIntegerFilter("start", context);
		Integer limit = getIntegerFilter("limit", context);
		
		pagination.limit(limit == null ? 20 : limit);
		pagination.start(start == null ? 0 : start);
		
		List<User> results = Context.getService(UserDataService.class).findUsers(query, role, address, dateFrom, dateTo,
		    pagination);
		// convert to UserAndPassword class
		final List<UserAndPassword1_8> usersResult = new ArrayList<UserAndPassword1_8>();
		for (User user : results) {
			usersResult.add(new UserAndPassword1_8(user));
		}
		
		return new NeedsPaging<UserAndPassword1_8>(usersResult, context);
	}
	
	@PropertyGetter("location")
	public Location getLocation(UserAndPassword1_8 user) {
		// Ideally should never be null / voided
		if (user.getUser().getPerson() != null)
			for (PersonAttribute attribute : user.getUser().getPerson().getActiveAttributes()) {
				if (attribute.getAttributeType().getName().toLowerCase().matches("location")
				        || attribute.getAttributeType().getName().toLowerCase().matches("health facility")
				        || attribute.getAttributeType().getName().toLowerCase().matches("health center")) {
					return (Location) attribute.getHydratedObject();
				}
			}
		return null;
	}
	
	@PropertyGetter("provider")
	public Provider getProvider(UserAndPassword1_8 user) {
		// Ideally should never be null / voided
		if (user.getUser().getPerson() != null) {
			Collection<Provider> providerList = Context.getProviderService()
			        .getProvidersByPerson(user.getUser().getPerson());
			if (providerList.size() > 0) {
				return providerList.iterator().next();
			}
		}
		
		return null;
	}
	
	private void setAttribute(User user, String attributeType, Object value) {
		PersonAttribute attribute = getAttribute(user, attributeType);
		
		if (attribute == null) {
			PersonAttributeType attributeT = Context.getPersonService().getPersonAttributeTypeByName(attributeType);
			
			if (attributeT == null) {
				throw new ResourceDoesNotSupportOperationException("No attribute type '" + attributeType + "' found");
			}
			
			attribute = new PersonAttribute();
			attribute.setAttributeType(attributeT);
		}
		
		attribute.setValue((String) value);
		
		user.getPerson().addAttribute(attribute);
	}
	
	private PersonAttribute getAttribute(User user, String attribute) {
		if (user.getPerson() != null)
			for (PersonAttribute att : user.getPerson().getActiveAttributes()) {
				if (att.getAttributeType().getName().toLowerCase().equalsIgnoreCase(attribute)) {
					return att;
				}
			}
		return null;
	}
	
}
