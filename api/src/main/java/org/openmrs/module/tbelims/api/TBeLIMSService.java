/**
 * This Source Code Form is subject to the terms of the Mozilla License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.tbelims.api;

import java.util.List;

import org.openmrs.api.OpenmrsService;

/**
 * The main service of this module, which is exposed for other modules. See
 * moduleApplicationContext.xml on how it is wired up.
 */
@SuppressWarnings("rawtypes")
public interface TBeLIMSService extends OpenmrsService {
	
	List getDataByHQL(String hql);
	
	List getDataBySQL(String sql);
	
	List getDataByHQLMapResult(String hql);
	
	List getDataBySQLMapResult(String sql);
	
	List getDataByHQL(String hql, int startRow, int endRow);
	
	List getDataByHQLMapResult(String hql, int startRow, int endRow);
}
