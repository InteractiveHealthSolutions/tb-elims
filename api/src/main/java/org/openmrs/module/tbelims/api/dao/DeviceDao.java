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

import org.hibernate.Criteria;
import org.hibernate.criterion.Disjunction;
import org.hibernate.criterion.Restrictions;
import org.openmrs.api.db.hibernate.DbSession;
import org.openmrs.api.db.hibernate.DbSessionFactory;
import org.openmrs.module.tbelims.Device;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository("tbelims.DeviceDao")
public class DeviceDao {
	
	@Autowired
	DbSessionFactory sessionFactory;
	
	private DbSession getSession() {
		return sessionFactory.getCurrentSession();
	}
	
	public Device getById(int id) {
		return (Device) getSession().createCriteria(Device.class).add(Restrictions.eq("deviceId", id)).uniqueResult();
	}
	
	public Device getByUuid(String uuid) {
		return (Device) getSession().createCriteria(Device.class).add(Restrictions.eq("uuid", uuid)).uniqueResult();
	}
	
	@SuppressWarnings("unchecked")
	public List<Device> getByLocation(int locationId) {
		return getSession().createCriteria(Device.class).createAlias("location", "l")
		        .add(Restrictions.eq("l.locationId", locationId)).list();
	}
	
	@SuppressWarnings("unchecked")
	public List<Device> getByOtherId(Integer locationId, String... identifiers) {
		Criteria cri = getSession().createCriteria(Device.class);
		
		if (locationId != null) {
			cri.createAlias("location", "l").add(Restrictions.eq("l.locationId", locationId));
		}
		
		Disjunction dis = Restrictions.disjunction();
		for (String ident : identifiers) {
			dis.add(Restrictions.eq("androidId", ident));
		}
		
		cri.add(dis);
		
		return cri.list();
	}
	
	@Transactional
	public Device addDevice(Device device) {
		getSession().save(device);
		return device;
	}
}
