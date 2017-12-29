package org.openmrs.module.tbelims.api;

import java.util.Date;
import java.util.List;

import org.openmrs.Order;
import org.openmrs.PersonAddress;

public interface OrderDataService {
	
	Order updateOrder(Order order);
	
	List<Order> findOrders(String patient, String location, List<String> orderTypes, PersonAddress address, Date dateFrom,
	        Date dateTo, PaginationHandler pagination);
	
}
