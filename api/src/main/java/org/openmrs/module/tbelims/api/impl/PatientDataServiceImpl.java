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

import org.openmrs.Patient;
import org.openmrs.PersonAddress;
import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.openmrs.module.tbelims.api.PatientDataService;
import org.openmrs.module.tbelims.api.dao.PatientListDao;

public class PatientDataServiceImpl extends BaseOpenmrsService implements PatientDataService {
	
	PatientListDao dao;
	
	public void setDao(PatientListDao dao) {
		this.dao = dao;
	}
	
	@Override
	public List<Patient> findPatients(String query, String gender, Integer ageFrom, Integer ageTo, PersonAddress address,
	        PaginationHandler pagination) {
		return dao.findPatients(query, gender, ageFrom, ageTo, address, pagination);
	}
	
}
