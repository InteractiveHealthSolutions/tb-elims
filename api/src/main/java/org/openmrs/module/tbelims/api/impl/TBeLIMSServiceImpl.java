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

import java.util.List;

import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.tbelims.api.TBeLIMSService;
import org.openmrs.module.tbelims.api.dao.TBeLIMSDao;

@SuppressWarnings("rawtypes")
public class TBeLIMSServiceImpl extends BaseOpenmrsService implements TBeLIMSService {
	
	TBeLIMSDao dao;
	
	public void setDao(TBeLIMSDao dao) {
		this.dao = dao;
	}
	
	public List getDataByHQL(String hql) {
		return dao.getDataByHQL(hql);
	}
	
	public List getDataBySQL(String sql) {
		return dao.getDataBySQL(sql);
	}
	
	public List getDataByHQLMapResult(String hql) {
		return dao.getDataByHQLMapResult(hql);
	}
	
	public List getDataBySQLMapResult(String sql) {
		return dao.getDataBySQLMapResult(sql);
	}
	
	public List getDataByHQL(String hql, int startRow, int endRow) {
		return dao.getDataByHQL(hql, startRow, endRow);
	}
	
	public List getDataByHQLMapResult(String hql, int startRow, int endRow) {
		return dao.getDataByHQLMapResult(hql, startRow, endRow);
	}
}
