package org.openmrs.module.tbelims.api.dao;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.Criteria;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.joda.time.DateTime;
import org.openmrs.Location;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository("tbelims.LocationListDao")
public class LocationListDao {
	
	@Autowired
	private DbSessionFactory sessionFactory;
	
	private DbSession getSession() {
		return sessionFactory.getCurrentSession();
	}
	
	@SuppressWarnings("unchecked")
	public List<Location> findLocations(String query, String parentLocation, List<String> tags, Map<String, Object> attributes,
			Date dateFrom, Date dateTo, PaginationHandler pagination) {
		List<Location> results = new LinkedList<>();
		
		Criteria cri = createSearchCriteria(parentLocation, tags, attributes, dateFrom, dateTo);
		
		// by a unique attribute having matching id
		if(StringUtils.isNotBlank(query)){
			//check if attribute identifier has value or reset criteria and check for name match
			if(attributes == null || attributes.isEmpty()){
				// if attributes is not empty then it would add alias in createSearchCriteria function 
				// so we should skip adding alias twice
				cri.createAlias("attributes", "attr");
				cri.createAlias("attr.attributeType", "attrType");
				cri.add(Restrictions.eq("attr.voided", false));
			}
			
			cri.add(Restrictions.ilike("attrType.name", "identifier", MatchMode.ANYWHERE))
				.add(Restrictions.eq("attr.valueReference", query));
			
			if(cri.list().size() == 0){
				cri = createSearchCriteria(parentLocation, tags, attributes, dateFrom, dateTo);
				cri.add(Restrictions.ilike("name", query, MatchMode.START));
			}
		}

		long total = ((Number) cri.setProjection(Projections.rowCount()).uniqueResult()).longValue();
		cri.setProjection(null).setResultTransformer(Criteria.DISTINCT_ROOT_ENTITY);
		
		pagination.setTotalRows(total);

		results = cri.setFirstResult(pagination.start()).setMaxResults(pagination.limit()).list();
		
		return results;
	}
	
	private Criteria createSearchCriteria(String parentLocation, List<String> tags, Map<String, Object> attributes,
	        Date dateFrom, Date dateTo) {
		Criteria criMain = getSession().createCriteria(Location.class);
		
		if (tags != null && !tags.isEmpty()) {
			criMain.createAlias("tags", "tg");
			
			criMain.add(Restrictions.eq("tg.retired", false)).add(Restrictions.in("tg.name", tags));
		}
		
		if (attributes != null && !attributes.isEmpty()) {
			criMain.createAlias("attributes", "attr");
			criMain.createAlias("attr.attributeType", "attrType");
			criMain.add(Restrictions.eq("attr.voided", false));
			
			// TODO can return ambiguous results for attributes having same values since it matches on keys and values separately
			criMain.add(Restrictions.in("attrType.name", attributes.keySet())).add(
			    Restrictions.in("attr.valueReference", attributes.values()));
		}
		
		if (StringUtils.isNotBlank(parentLocation)) {
			criMain.createAlias("parentLocation", "p");
			
			criMain.add(Restrictions.disjunction().add(Restrictions.eq("p.name", parentLocation))
			        .add(Restrictions.eq("p.uuid", parentLocation)).add(Restrictions.ilike("p.locationId", parentLocation)));
		}
		
		if (dateFrom != null) {
			DateTime d1 = new DateTime(dateFrom.getTime());
			DateTime d2 = dateTo == null ? DateTime.now() : new DateTime(dateTo.getTime());
			
			// TODO what if openmrs is ported to postgres or other DB
			// important to use greatest since or can badly impact performance
			criMain.add(Restrictions
			        .sqlRestriction("GREATEST( {alias}.date_created, IFNULL({alias}.date_changed,'00'), IFNULL({alias}.date_voided,'00')) BETWEEN '"
			                + d1.toString("yyyy-MM-dd") + "' AND '" + d2.toString("yyyy-MM-dd") + "'"));
		}
		return criMain;
	}
	
	public long countLocations(String parentLocation, List<String> tags, Map<String, Object> attributes,
	        MatchMode attributeMatch) {
		Criteria cri = getSession().createCriteria(Location.class);
		
		if (tags != null && !tags.isEmpty()) {
			cri.createAlias("tags", "tg").add(Restrictions.eq("tg.retired", false)).add(Restrictions.in("tg.name", tags));
		}
		
		if (attributes != null && !attributes.isEmpty()) {
			cri.createAlias("attributes", "at").createAlias("at.attributeType", "atType")
			        .add(Restrictions.eq("at.voided", false));
			
			for (String att : attributes.keySet()) {
				cri.add(Restrictions.eq("atType.name", att)).add(
				    Restrictions.ilike("at.valueReference", attributes.get(att).toString(), attributeMatch));
			}
		}
		
		if (StringUtils.isNotBlank(parentLocation)) {
			cri.createAlias("parentLocation", "p").add(
			    Restrictions.disjunction().add(Restrictions.eq("p.name", parentLocation))
			            .add(Restrictions.eq("p.uuid", parentLocation))
			            .add(Restrictions.ilike("p.locationId", parentLocation)));
		}
		
		return ((Number) cri.setProjection(Projections.rowCount()).uniqueResult()).longValue();
	}
}
