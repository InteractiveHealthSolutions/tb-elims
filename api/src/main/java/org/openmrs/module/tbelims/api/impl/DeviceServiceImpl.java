package org.openmrs.module.tbelims.api.impl;

import java.util.List;

import org.openmrs.api.impl.BaseOpenmrsService;
import org.openmrs.module.tbelims.Device;
import org.openmrs.module.tbelims.api.DeviceService;
import org.openmrs.module.tbelims.api.dao.DeviceDao;

public class DeviceServiceImpl extends BaseOpenmrsService implements DeviceService {
	
	DeviceDao dao;
	
	public void setDao(DeviceDao dao) {
		this.dao = dao;
	}
	
	@Override
	public Device getDeviceById(int id) {
		return dao.getById(id);
	}
	
	@Override
	public Device getDeviceByUuid(String uuid) {
		return dao.getByUuid(uuid);
	}
	
	@Override
	public List<Device> getDeviceByLocation(int locationId) {
		return dao.getByLocation(locationId);
	}
	
	@Override
	public List<Device> getDeviceByOtherId(Integer locationId, String... identifiers) {
		return dao.getByOtherId(locationId, identifiers);
	}
	
	@Override
	public Device addDevice(Device device) {
		return dao.addDevice(device);
	}
	
}
