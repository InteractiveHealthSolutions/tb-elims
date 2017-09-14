package org.openmrs.module.tbelims.api.dao;

import java.lang.reflect.Field;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.Criteria;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.joda.time.DateTime;
import org.openmrs.Patient;
import org.openmrs.PersonAddress;
import org.openmrs.api.context.Context;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.openmrs.util.OpenmrsConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository("tbelims.PatientListDao")
public class PatientListDao {
	
	@Autowired
	private DbSessionFactory sessionFactory;
	
	private DbSession getSession() {
		return sessionFactory.getCurrentSession();
	}
	
	@SuppressWarnings("unchecked")
	public List<Patient> findPatients(String query, String gender, Integer ageFrom, Integer ageTo, 
			PersonAddress address, PaginationHandler pagination) {
		List<Patient> results = new LinkedList<>();
		Criteria cri = getSession().createCriteria(Patient.class);
		
		String minChars = Context.getAdministrationService().getGlobalProperty(OpenmrsConstants.GLOBAL_PROPERTY_MIN_SEARCH_CHARACTERS);

		if (minChars == null || !StringUtils.isNumeric(minChars)) {
			minChars = "" + OpenmrsConstants.GLOBAL_PROPERTY_DEFAULT_MIN_SEARCH_CHARACTERS;
		}
		
		// query must be non gt-eq configured digits for id/attribute search
		// if query is meant for id/attribute it would be aimed to get unique or small set of results
		if(StringUtils.isNotBlank(query) && query.trim().length() >= Integer.valueOf(minChars)){
			cri.createAlias("identifiers", "id");
	
			// find by identifier and if any exists return unique patient
			results = cri.add(Restrictions.eq("id.identifier", query)).list();
			if(results.size() > 0){
				return results;
			}
			
			cri = getSession().createCriteria(Patient.class);
			// if query was not for identifier check for searchable attributes
			cri.createAlias("attributes", "at")
				.createAlias("at.attributeType", "atType");
			
			results = cri.add(Restrictions.eq("at.value", query))
					.add(Restrictions.eq("atType.searchable", true))
					.list();
			
			if(results.size() > 0){
				return results;
			}
		}
		
		cri = getSession().createCriteria(Patient.class);
		// query was not for searchable attribute it must be for name
		// name can be accompained with gender, age, address filters
		
		if(StringUtils.isNotBlank(query)){
			cri.createAlias("names", "pn");
			
			Criterion fn = Restrictions.like("pn.givenName", query, MatchMode.START);
			Criterion ln = Restrictions.like("pn.familyName", query, MatchMode.START);
			Criterion mn = Restrictions.like("pn.middleName", query, MatchMode.START);

			cri.add(Restrictions.disjunction().add(fn).add(mn).add(ln));
		}
		
		if(StringUtils.isNotBlank(gender)){
			cri.add(Restrictions.like("gender", gender, MatchMode.START));
		}
		
		if(ageFrom != null && ageTo != null){
			// age around mentioned years with a threshold of 1 year
			DateTime dobFrom = DateTime.now().minusYears(ageFrom+1);
			DateTime dobTo = DateTime.now().minusYears(ageTo-1);
			cri.add(Restrictions.between("birthdate", dobFrom.toDate(), dobTo.toDate()));
		}
		
		// if there is any address field to be included in search
		if(address != null){
			cri.createAlias("addresses", "ad");
			
			try {
				addAddressCriteria(address, cri, new String[]{"address1", "address2", "address3", 
						"address4", "address5", "address6", "cityVillage", "country", "countyDistrict",
						"postalCode", "stateProvince"});
			} 
			catch (ClassNotFoundException | NoSuchFieldException | SecurityException | IllegalArgumentException
					| IllegalAccessException e) {
				e.printStackTrace();
				throw new RuntimeException(e);
			}
		}
		
		long total = ((Number) cri.setProjection(Projections.rowCount()).uniqueResult()).longValue();
		cri.setProjection(null).setResultTransformer(Criteria.DISTINCT_ROOT_ENTITY);
		
		pagination.setTotalRows(total);

		results = cri.setFirstResult(pagination.start()).setMaxResults(pagination.limit()).list();
		
		return results;
	}
	
	@SuppressWarnings("unchecked")
	private void addAddressCriteria(PersonAddress address, Criteria cri, String... filterFields)
	        throws ClassNotFoundException, NoSuchFieldException, SecurityException, IllegalArgumentException,
	        IllegalAccessException {
		for (String filter : filterFields) {
			Class<PersonAddress> cl = (Class<PersonAddress>) Class.forName("org.openmrs.PersonAddress");
			
			Field classField = cl.getDeclaredField(filter);
			classField.setAccessible(true);
			
			Object valobj = classField.get(address);
			if (valobj != null && StringUtils.isNotBlank(valobj.toString())) {
				cri.add(Restrictions.eq("ad." + filter, valobj.toString()));
			}
		}
	}
}
