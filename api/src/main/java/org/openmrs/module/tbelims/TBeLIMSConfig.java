/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.tbelims;

import java.util.Iterator;

import org.hibernate.Criteria;
import org.hibernate.criterion.Criterion;
import org.hibernate.impl.CriteriaImpl;
import org.hibernate.impl.CriteriaImpl.CriterionEntry;
import org.springframework.stereotype.Component;

/**
 * Contains module's config.
 */
@Component("tbelims.TBeLIMSConfig")
public class TBeLIMSConfig {
	
	public final static String MODULE_PRIVILEGE = "TB eLIMS Privilege";
	
	@SuppressWarnings("unchecked")
	public static void removeCriterions(Criteria criteria, Class<? extends Criterion> type) {
		Iterator<CriterionEntry> criterionIterator = ((CriteriaImpl) criteria).iterateExpressionEntries();
		while (criterionIterator.hasNext()) {
			CriterionEntry criterionEntry = criterionIterator.next();
			if (criterionEntry.getCriteria() == criteria) {
				Criterion criterion = criterionEntry.getCriterion();
				if (null == type || criterion.getClass() == type) {
					criterionIterator.remove();
				}
			}
		}
	}
}
