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

import org.openmrs.Location;
import org.openmrs.User;
import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.openmrs.module.tbelims.api.UserDataService;
import org.openmrs.module.tbelims.api.dao.UserListDao;

public class UserDataServiceImpl extends BaseOpenmrsService implements UserDataService {
	
	UserListDao dao;
	
	public void setDao(UserListDao dao) {
		this.dao = dao;
	}
	
	@Override
	public List<User> findUsers(String query, String role, Location address, Date dateFrom, Date dateTo,
	        PaginationHandler pagination) {
		return dao.findUsers(query, role, address, dateFrom, dateTo, pagination);
	}
	
}
