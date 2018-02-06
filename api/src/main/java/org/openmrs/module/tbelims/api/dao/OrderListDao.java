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
import org.joda.time.DateTime;
import org.openmrs.Order;
import org.openmrs.PersonAddress;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository("tbelims.OrderListDao")
public class OrderListDao {
	
	@Autowired
	private DbSessionFactory sessionFactory;
	
	private DbSession getSession() {
		return sessionFactory.getCurrentSession();
	}
	
	@Transactional
	public Order updateOrder(final Order order) {
		DbSession ses = getSession();
		ses.saveOrUpdate(order);
		return order;
		
		/*tx.commit();
		ses.flush();
		return ses.doReturningWork(new ReturningWork<Order>() {
			
			@Override
			public Order execute(Connection connection) throws SQLException {
				PreparedStatement ps = connection.prepareStatement("UPDATE orders " + " SET accession_number=?, "
				        + " instructions=?, " + " comment_to_fulfiller=? WHERE order_id=?");
				ps.setString(1, order.getAccessionNumber());
				ps.setString(2, order.getInstructions());
				ps.setString(3, order.getCommentToFulfiller());
				ps.setInt(4, order.getId());
				
				ps.executeUpdate();
				
				if (connection.getAutoCommit() == false) {
					connection.commit();
				}
				return order;
			}
		});*/
	}
	
	public Order getOrderByUuid(String uuid) {
		return (Order) getSession().createQuery("from Order o where o.uuid = :uuid").setString("uuid", uuid).uniqueResult();
	}
	
	public Order getOrderByOrderNumber(String orderNumber) {
		Criteria searchCriteria = getSession().createCriteria(Order.class, "order");
		searchCriteria.add(Restrictions.eq("order.orderNumber", orderNumber));
		return (Order) searchCriteria.uniqueResult();
	}
	
	@SuppressWarnings("unchecked")
	public List<Order> findOrders(String patient, String location, List<String> orderTypes, 
			PersonAddress address, Date dateFrom, Date dateTo, PaginationHandler pagination) {
		List<Order> results = new LinkedList<>();
		Criteria cri = getSession().createCriteria(Order.class);
		
		cri.createAlias("concept", "c");
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
			cri.createAlias("encounter", "e");
			cri.createAlias("e.location", "l");

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
		
		if(orderTypes != null && !orderTypes.isEmpty()){
			cri.createAlias("orderType", "ot");
			cri.add(Restrictions.in("ot.name", orderTypes));
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

			// TODO what if openmrs is ported to postgres or other DB
			cri.add(Restrictions.sqlRestriction(" DATE(GREATEST({alias}.date_created, IFNULL({alias}.date_stopped,'00'), IFNULL({alias}.date_voided,'00') "
					+ "		) ) BETWEEN '"+d1.toString("yyyy-MM-dd")+"' AND '"+d2.toString("yyyy-MM-dd")+"' "));
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
