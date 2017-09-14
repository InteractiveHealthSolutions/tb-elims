package org.openmrs.module.tbelims.web.rest.resources;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.openmrs.Location;
import org.openmrs.LocationAttribute;
import org.openmrs.LocationTag;
import org.openmrs.api.context.Context;
import org.openmrs.module.tbelims.Constants;
import org.openmrs.module.webservices.rest.SimpleObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller("${rootrootArtifactId}.LocationDataController")
@RequestMapping("/data/rest/" + Constants.TBELIMS_MODULE_ID + "/location")
public class LocationDataController {
	
	@RequestMapping(value = "/tree.json", method = RequestMethod.GET)
	public @ResponseBody
	SimpleObject getLocationTree() {
		SimpleObject result = new SimpleObject();
		Logger.getLogger(getClass()).info("I AM IN THIS IDIOT METHOD");
		try {
			result.put("data", getHierarchyAsJson());
		}
		catch (IOException e) {
			e.printStackTrace();
		}
		
		return result;
	}
	
	/**
	 * Gets JSON formatted for jstree jquery plugin [ { data: ..., children: ...}, ... ]
	 * 
	 * @return
	 * @throws IOException
	 */
	private String getHierarchyAsJson() throws IOException {
		// TODO fetch all locations at once to avoid n+1 lazy-loads
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (Location loc : Context.getLocationService().getAllLocations()) {
			if (loc.getParentLocation() == null) {
				list.add(toJsonHelper(loc));
			}
		}
		
		// If this gets slow with lots of locations then switch out ObjectMapper for the
		// stream-based version. (But the TODO above is more likely to be a performance hit.)
		StringWriter w = new StringWriter();
		ObjectMapper mapper = new ObjectMapper();
		mapper.writeValue(w, list);
		return w.toString();
	}
	
	/**
	 * { data: "Location's name (tags)", children: [ recursive calls to this method, ... ] }
	 * 
	 * @param loc
	 * @return
	 */
	private Map<String, Object> toJsonHelper(Location loc) {
		Map<String, Object> ret = new LinkedHashMap<String, Object>();
		StringBuilder sb = new StringBuilder(loc.getName());
		if (loc.getTags() != null && loc.getTags().size() > 0) {
			sb.append(" (");
			for (Iterator<LocationTag> i = loc.getTags().iterator(); i.hasNext();) {
				LocationTag t = i.next();
				sb.append(t.getName());
				if (i.hasNext())
					sb.append(", ");
			}
			sb.append(")");
		}
		ret.put("display", sb.toString());
		ret.put("voided", loc.getRetired());
		ret.put("name", loc.getName());
		ret.put("parent", loc.getParentLocation() == null ? null : loc.getParentLocation().getName());
		ret.put("tags", formatTags(loc.getTags()));
		ret.put("attributes", formatAttributes(loc.getAttributes()));
		
		if (loc.getChildLocations() != null && loc.getChildLocations().size() > 0) {
			List<Map<String, Object>> children = new ArrayList<Map<String, Object>>();
			for (Location child : loc.getChildLocations())
				children.add(toJsonHelper(child));
			ret.put("children", children);
		}
		return ret;
	}
	
	private List<Map<String, String>> formatTags(Set<LocationTag> tags) {
		List<Map<String, String>> list = new ArrayList<>();
		for (LocationTag t : tags) {
			Map<String, String> m = new HashMap<>();
			m.put("name", t.getName());
			m.put("uuid", t.getUuid());
			
			list.add(m);
		}
		
		return list;
	}
	
	private List<Map<String, String>> formatAttributes(Set<LocationAttribute> attributes) {
		List<Map<String, String>> list = new ArrayList<>();
		for (LocationAttribute a : attributes) {
			Map<String, String> m = new HashMap<>();
			m.put("name", a.getAttributeType().getName());
			m.put("uuid", a.getUuid());
			m.put("value", a.getValue().toString());
			
			list.add(m);
		}
		
		return list;
	}
}
