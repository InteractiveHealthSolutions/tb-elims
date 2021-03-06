/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.tbelims.api;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.hibernate.criterion.MatchMode;
import org.openmrs.Location;

public interface LocationDataService {
	
	List<Location> findLocations(String query, String parentLocation, List<String> tags, Map<String, Object> attributes,
	        Date dateFrom, Date dateTo, PaginationHandler pagination);
	
	long countLocations(String parentLocation, List<String> tags, Map<String, Object> attributes, MatchMode attributeMatch);
}
