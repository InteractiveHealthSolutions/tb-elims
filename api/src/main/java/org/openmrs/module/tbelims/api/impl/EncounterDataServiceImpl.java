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

import org.openmrs.Encounter;
import org.openmrs.PersonAddress;
import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.tbelims.api.PaginationHandler;
import org.openmrs.module.tbelims.api.EncounterDataService;
import org.openmrs.module.tbelims.api.dao.EncounterListDao;

public class EncounterDataServiceImpl extends BaseOpenmrsService implements EncounterDataService {
	
	EncounterListDao dao;
	
	public void setDao(EncounterListDao dao) {
		this.dao = dao;
	}
	
	@Override
	public List<Encounter> findEncounters(String patient, String location, List<String> encounterTypes,
	        PersonAddress address, Date dateFrom, Date dateTo, PaginationHandler pagination) {
		return dao.findEncounters(patient, location, encounterTypes, address, dateFrom, dateTo, pagination);
	}
	
}
