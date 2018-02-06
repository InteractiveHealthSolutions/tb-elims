package org.openmrs.module.tbelims.web.rest.resources;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Scanner;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.openmrs.api.context.Context;
import org.openmrs.module.tbelims.Constants;
import org.openmrs.module.tbelims.api.TBeLIMSService;
import org.openmrs.module.webservices.rest.SimpleObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller("${rootrootArtifactId}.ReportingDataResource")
@RequestMapping("/data/rest/" + Constants.TBELIMS_MODULE_ID + "/report")
public class ReportingDataResource {
	
	@RequestMapping(value = "/data", method = RequestMethod.GET)
	public @ResponseBody
	SimpleObject getReportData(@RequestParam("reportId") String report,
	        @RequestParam(value = "locationId", required = false) String locationId,
	        @RequestParam(value = "from", required = false) String from,
	        @RequestParam(value = "to", required = false) String to) {
		
		SimpleObject result = new SimpleObject();
		Logger.getLogger(getClass()).info("Loading report " + report);
		
		ClassPathResource cpr = new ClassPathResource(report + ".sql");
		try {
			System.out.println("FROM " + cpr.getFile().getAbsolutePath());
			
			Scanner sc = new Scanner(cpr.getFile());
			String query = sc.useDelimiter("\\Z").next()
			        .replace("@dateFrom", "'" + (StringUtils.isBlank(from) ? "" : from) + "'")
			        .replace("@dateTo", "'" + (StringUtils.isBlank(to) ? "" : to) + "'")
			        .replace("@locationId", "'" + (StringUtils.isBlank(locationId) ? "" : locationId) + "'");
			
			// System.out.println(query);
			
			result.put("report", Context.getService(TBeLIMSService.class).getDataBySQLMapResult(query));
			sc.close();
		}
		catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		catch (IOException e) {
			e.printStackTrace();
		}
		
		return result;
	}
}
