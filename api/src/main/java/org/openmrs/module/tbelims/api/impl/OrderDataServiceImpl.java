/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.tbelims.api.impl;

import java.util.Date;
import java.util.List;

import org.openmrs.Order;
import org.openmrs.PersonAddress;
import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.tbelims.api.OrderDataService;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.openmrs.module.tbelims.api.dao.OrderListDao;

public class OrderDataServiceImpl extends BaseOpenmrsService implements OrderDataService {
	
	OrderListDao dao;
	
	public void setDao(OrderListDao dao) {
		this.dao = dao;
	}
	
	@Override
	public List<Order> findOrders(String patient, String location, List<String> orderTypes, PersonAddress address,
	        Date dateFrom, Date dateTo, PaginationHandler pagination) {
		return dao.findOrders(patient, location, orderTypes, address, dateFrom, dateTo, pagination);
	}
	
	@Override
	public Order updateOrder(Order order) {
		return dao.updateOrder(order);
	}
	
}
