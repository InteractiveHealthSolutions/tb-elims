package org.openmrs.module.tbelims.web.rest.resources;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openmrs.Location;
import org.openmrs.api.context.Context;
import org.openmrs.module.tbelims.Constants;
import org.openmrs.module.tbelims.Device;
import org.openmrs.module.tbelims.api.DeviceService;
import org.openmrs.module.webservices.rest.SimpleObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller("${rootrootArtifactId}.DeviceDataResource")
@RequestMapping("/data/rest/" + Constants.TBELIMS_MODULE_ID + "/device")
public class DeviceDataResource {
	
	@RequestMapping(method = RequestMethod.GET)
	public @ResponseBody
	SimpleObject getDevice(@RequestParam(value = "locationId", required = true) Integer locationId,
	        @RequestParam(value = "androidId") String androidId,
	        @RequestParam(value = "serialId", required = false) String serialId,
	        @RequestParam(value = "macId", required = false) String macId) {
		
		System.out.println("WHY I M HERE");
		
		SimpleObject result = new SimpleObject();
		
		List<Device> device = Context.getService(DeviceService.class).getDeviceByOtherId(locationId, androidId, serialId,
		    macId);
		
		Device dev = null;
		
		if (device.size() > 0) {
			dev = device.get(0);
		} else {
			Location l = Context.getLocationService().getLocation(locationId);
			
			Device d = new Device();
			d.setAndroidId(androidId);
			d.setSerialId(serialId);
			d.setMacId(macId);
			d.setCreator(Context.getAuthenticatedUser());
			d.setDateCreated(new Date());
			// d.setLastCount(0);
			// d.setLastSyncDate(lastSyncDate);
			d.setLocation(l);
			d.setName(androidId + " " + l.getName());
			
			dev = Context.getService(DeviceService.class).addDevice(d);
		}
		
		result.put("deviceId", dev.getDeviceId());
		result.put("androidId", dev.getAndroidId());
		result.put("macId", dev.getMacId());
		result.put("serialId", dev.getSerialId());
		result.put("retired", dev.getRetired());
		result.put("location", dev.getLocation().getUuid());
		result.put("uuid", dev.getUuid());
		
		return result;
	}
	
	public static void main(String[] args) {
		Map<String, Object> result = new HashMap<>();

		result.put("deviceId", "dev.getDeviceId()");
		result.put("androidId", "dev.getAndroidId()");
		result.put("macId", "dev.getMacId()");
		result.put("serialId", "dev.getSerialId()");
		result.put("retired", "dev.getRetired()");
		result.put("location", "dev.getLocation().getUuid()");
		result.put("uuid", "dev.getUuid()");
		
		System.out.println(result);
	}
}
