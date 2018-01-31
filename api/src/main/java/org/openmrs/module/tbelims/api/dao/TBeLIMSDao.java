/**
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
package org.openmrs.module.tbelims.api.dao;

import java.util.List;

import org.hibernate.criterion.Restrictions;
import org.hibernate.transform.Transformers;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.tbelims.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository("tbelims.TBeLIMSDao")
public class TBeLIMSDao {
	
	@Autowired
	DbSessionFactory sessionFactory;
	
	private DbSession getSession() {
		return sessionFactory.getCurrentSession();
	}
	
	public List getDataByHQL(String hql) {
		return getSession().createQuery(hql).list();
	}
	
	public List getDataBySQL(String sql) {
		return getSession().createSQLQuery(sql).list();
	}
	
	public List getDataByHQLMapResult(String hql) {
		return getSession().createQuery(hql).setResultTransformer(Transformers.ALIAS_TO_ENTITY_MAP).list();
	}
	
	public List getDataBySQLMapResult(String sql) {
		return getSession().createSQLQuery(sql).setResultTransformer(Transformers.ALIAS_TO_ENTITY_MAP).list();
	}
	
	public List getDataByHQL(String hql, Integer startRow, Integer endRow) {
		return getSession().createQuery(hql).setFirstResult(startRow).setMaxResults(endRow).list();
	}
	
	public List getDataByHQLMapResult(String hql, Integer startRow, Integer endRow) {
		return getSession().createQuery(hql).setResultTransformer(Transformers.ALIAS_TO_ENTITY_MAP).setFirstResult(startRow)
		        .setMaxResults(endRow).list();
	}
}
