package org.openmrs.module.tbelims.api;

import java.util.List;

import org.openmrs.module.tbelims.Device;

public interface DeviceService {
	
	Device getDeviceById(int id);
	
	Device getDeviceByUuid(String uuid);
	
	List<Device> getDeviceByLocation(int locationId);
	
	List<Device> getDeviceByOtherId(Integer locationId, String... identifiers);
	
	Device addDevice(Device device);
}
