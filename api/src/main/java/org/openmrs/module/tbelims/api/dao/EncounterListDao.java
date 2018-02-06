package org.openmrs.module.tbelims.api.dao;

import java.lang.reflect.Field;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.Criteria;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.hibernate.internal.CriteriaImpl;
import org.hibernate.internal.SessionImpl;
import org.hibernate.loader.OuterJoinLoader;
import org.hibernate.loader.criteria.CriteriaLoader;
import org.hibernate.persister.entity.OuterJoinLoadable;
import org.joda.time.DateTime;
import org.openmrs.Encounter;
import org.openmrs.PersonAddress;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository("tbelims.EncounterListDao")
public class EncounterListDao {
	
	@Autowired
	private DbSessionFactory sessionFactory;
	
	private DbSession getSession() {
		return sessionFactory.getCurrentSession();
	}
	
	@SuppressWarnings("unchecked")
	public List<Encounter> findEncounters(String patient, String location, List<String> encounterTypes, 
			PersonAddress address, Date dateFrom, Date dateTo, PaginationHandler pagination) {
		List<Encounter> results = new LinkedList<>();
		Criteria cri = getSession().createCriteria(Encounter.class);
		
		cri.createAlias("patient", "p");
		
		if(StringUtils.isNotBlank(patient)){
			if(NumberUtils.isNumber(patient)){
				cri.add(Restrictions.eq("p.patientId", Integer.parseInt(patient)));
			}
			else if(patient.length() < 30){
				cri.createAlias("p.identifiers", "id");
				
				cri.add(Restrictions.eq("id.identifier", patient));
			}
			else {
				cri.add(Restrictions.eq("p.uuid", patient));
			}
		}
		
		if(StringUtils.isNotBlank(location)){
			cri.createAlias("location", "l");

			if(NumberUtils.isNumber(location)){
				cri.add(Restrictions.eq("l.locationId", Integer.parseInt(location)));
			}
			// TODO what if location names are gt 30
			else if(location.length() < 30){
				cri.add(Restrictions.eq("l.name", location));
			}
			else {
				cri.add(Restrictions.eq("l.uuid", location));
			}
		}
		
		if(encounterTypes != null && !encounterTypes.isEmpty()){
			cri.createAlias("encounterType", "et");
			cri.add(Restrictions.in("et.name", encounterTypes));
		}
		
		// if there is any address field to be included in search
		if(address != null){
			cri.createAlias("p.addresses", "ad");

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
		
		if(dateFrom != null){
			DateTime d1 = new DateTime(dateFrom.getTime());
			DateTime d2 = dateTo == null?DateTime.now():new DateTime(dateTo.getTime());

			String sql = "SELECT distinct e.encounter_id FROM encounter e "
					+ " JOIN obs o ON o.encounter_id=e.encounter_id "
					+ " WHERE DATE(GREATEST(e.date_created, IFNULL(e.date_changed,'00'), IFNULL(e.date_voided,'00'), "
					+ "			o.date_created, IFNULL(o.date_voided,'00') "
					+ "		) ) BETWEEN '"+d1.toString("yyyy-MM-dd")+"' AND '"+d2.toString("yyyy-MM-dd")+"' ";
			
			// TODO what if openmrs is ported to postgres or other DB
			System.err.println(sql);

			//TODO should we add paging in this query
			List<Integer> dateFiltered = getSession().createSQLQuery(sql).list();
			// adding a dummy negative int to make sure that query doesnot crash when no patient lies in given date range
			dateFiltered.add(-1);
			cri.add(Restrictions.in("encounterId", dateFiltered));
		}
		
		long total = ((Number) cri.setProjection(Projections.rowCount()).uniqueResult()).longValue();
		cri.setProjection(null).setResultTransformer(Criteria.DISTINCT_ROOT_ENTITY);
		
		System.out.println(toSql(cri));
		
		pagination.setTotalRows(total);

		results = cri.setFirstResult(pagination.start()).setMaxResults(pagination.limit()).list();
		
		return results;
	}
	
	public static String toSql(Criteria criteria) {
		try {
			CriteriaImpl c = (CriteriaImpl) criteria;
			SessionImpl s = (SessionImpl) c.getSession();
			SessionFactoryImplementor factory = (SessionFactoryImplementor) s.getSessionFactory();
			String[] implementors = factory.getImplementors(c.getEntityOrClassName());
			CriteriaLoader loader = new CriteriaLoader((OuterJoinLoadable) factory.getEntityPersister(implementors[0]),
			        factory, c, implementors[0], s.getLoadQueryInfluencers());
			
			Field f = OuterJoinLoader.class.getDeclaredField("sql");
			f.setAccessible(true);
			return (String) f.get(loader);
		}
		catch (Exception e) {
			throw new RuntimeException(e);
		}
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
