package org.openmrs.module.tbelims.api.dao;

import java.lang.reflect.Field;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.Criteria;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.joda.time.DateTime;
import org.openmrs.Location;
import org.openmrs.User;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository("tbelims.UserListDao")
public class UserListDao {
	
	@Autowired
	private DbSessionFactory sessionFactory;
	
	private DbSession getSession() {
		return sessionFactory.getCurrentSession();
	}
	
	@SuppressWarnings("unchecked")
	public List<User> findUsers(String query, String role, Location address, Date dateFrom, Date dateTo, PaginationHandler pagination) {
		List<User> results = new LinkedList<>();
		Criteria cri = getSession().createCriteria(User.class);
		
		// query must be non gt-eq configured digits for username/attribute search
		// if query is meant for username/attribute it would be aimed to get unique or small set of results
		if(StringUtils.isNotBlank(query)){
			results = cri.add(Restrictions.eq("username", query)).list();
			if(results.size() > 0){
				pagination.setTotalRows(results.size());
				return results;
			}
			
			cri = getSession().createCriteria(User.class);
			cri.createAlias("person", "p");
			
			cri.createAlias("p.attributes", "at");
			cri.createAlias("at.attributeType", "atType");

			// if query was not for identifier check for searchable attributes
			results = cri.add(Restrictions.eq("at.value", query))
					.add(Restrictions.eq("atType.searchable", true))
					.list();
			
			if(results.size() > 0){
				pagination.setTotalRows(results.size());
				return results;
			}
		}
		
		cri = getSession().createCriteria(User.class);
		cri.createAlias("person", "p");
		Criteria pnCri = cri.createCriteria("p.names", "pn");

		// query was not for searchable attribute it must be for name
		// name can be accompanied with gender, age, address filters
		
		if(StringUtils.isNotBlank(query)){
			Criterion fn = Restrictions.ilike("pn.givenName", query, MatchMode.START);
			Criterion ln = Restrictions.ilike("pn.familyName", query, MatchMode.START);
			Criterion mn = Restrictions.ilike("pn.middleName", query, MatchMode.START);

			pnCri.add(Restrictions.disjunction().add(fn).add(mn).add(ln));
		}
		
		if(StringUtils.isNotBlank(role)){
			cri.createAlias("roles", "r");
			cri.add(Restrictions.eq("r.role", role));
		}
		
		// if there is any address field to be included in search
		if(address != null){
			Criteria locationCri = getSession().createCriteria(Location.class);
			try {
				addAddressCriteria(address, locationCri, new String[]{"name", "address1", "address2", "address3", 
						"address4", "address5", "address6", "cityVillage", "country", "countyDistrict",
						"postalCode", "stateProvince"});
			} 
			catch (ClassNotFoundException | NoSuchFieldException | SecurityException | IllegalArgumentException
					| IllegalAccessException e) {
				e.printStackTrace();
				throw new RuntimeException(e);
			}
			
			locationCri.setProjection(Projections.property("locationId"));
			List<Integer> locationList = locationCri.list();
			
			cri.createAlias("p.attributes", "at");
			cri.createAlias("at.attributeType", "atType");
			cri.add(Restrictions.in("atType.name", new String[]{"location", "lab", "center"}));
			cri.add(Restrictions.in("at.value", locationList));
		}
		
		if(dateFrom != null){
			DateTime d1 = new DateTime(dateFrom.getTime());
			DateTime d2 = dateTo == null?DateTime.now():new DateTime(dateTo.getTime());

			String sql = "SELECT distinct u.person_id FROM users u "
					+ " JOIN person_name pn ON pn.person_id=u.person_id "
					+ " LEFT JOIN person_attribute pat ON pat.person_id=u.person_id "
					+ " LEFT JOIN person_address pa ON pa.person_id=u.person_id "
					+ " WHERE DATE(GREATEST(u.date_created, IFNULL(u.date_changed,'00'), IFNULL(u.date_voided,'00'), "
					+ "			pn.date_created, IFNULL(pn.date_changed,'00'), IFNULL(pn.date_voided,'00'), "
					+ "			IFNULL(pat.date_created,'00'), IFNULL(pat.date_changed,'00'), IFNULL(pat.date_voided,'00'), "
					+ "			IFNULL(pa.date_created,'00'), IFNULL(pa.date_changed,'00'), IFNULL(pa.date_voided,'00') "
					+ "		) ) BETWEEN '"+d1.toString("yyyy-MM-dd")+"' AND '"+d2.toString("yyyy-MM-dd")+"' ";
			
			// TODO what if openmrs is ported to postgres or other DB
			System.err.println(sql);

			//TODO should we add paging in this query
			List<Integer> dateFiltered = getSession().createSQLQuery(sql).list();
			// adding a dummy negative int to make sure that query doesnot crash when no user lies in given date range
			dateFiltered.add(-1);
			cri.add(Restrictions.in("personId", dateFiltered));
		}
		
		long total = ((Number) cri.setProjection(Projections.rowCount()).uniqueResult()).longValue();
		cri.setProjection(null).setResultTransformer(Criteria.DISTINCT_ROOT_ENTITY);
		
		pagination.setTotalRows(total);

		results = cri.setFirstResult(pagination.start()).setMaxResults(pagination.limit()).list();
		
		return results;
	}
	
	@SuppressWarnings("unchecked")
	private void addAddressCriteria(Location address, Criteria cri, String... filterFields) throws ClassNotFoundException,
	        NoSuchFieldException, SecurityException, IllegalArgumentException, IllegalAccessException {
		for (String filter : filterFields) {
			Class<Location> cl = (Class<Location>) Class.forName("org.openmrs.Location");
			
			Field classField = cl.getDeclaredField(filter);
			classField.setAccessible(true);
			
			Object valobj = classField.get(address);
			if (valobj != null && StringUtils.isNotBlank(valobj.toString())) {
				cri.add(Restrictions.eq(filter, valobj.toString()));
			}
		}
	}
}
