package org.openmrs.module.tbelims.web.rest.resources;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Scanner;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.openmrs.module.tbelims.Constants;
import org.openmrs.module.webservices.rest.SimpleObject;
import org.openmrs.module.wsrestext.WSContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import liquibase.util.csv.CSVWriter;

@Controller(Constants.TBELIMS_MODULE_ID + ".ReportingDataResource")
@RequestMapping("/data/rest/" + Constants.TBELIMS_MODULE_ID + "/report")
public class ReportingDataResource {
	
	@SuppressWarnings("rawtypes")
	@RequestMapping(value = "/data", method = RequestMethod.GET)
	public @ResponseBody
	SimpleObject getReportData(@RequestParam("reportId") String report,
	        @RequestParam(value = "locationId") String locationId, @RequestParam(value = "from") String from,
	        @RequestParam(value = "to") String to, HttpServletResponse response) {
		
		SimpleObject result = new SimpleObject();
		Logger.getLogger(getClass()).info("Loading report data" + report);
		
		ClassPathResource cpr = new ClassPathResource("data_" + report + ".sql");
		try {
			System.out.println("FROM " + cpr.getFile().getAbsolutePath());
			
			Scanner sc = new Scanner(cpr.getFile());
			
			String query = sc.useDelimiter("\\Z").next()
			        .replace("@dateFrom", "'" + (StringUtils.isBlank(from) ? "" : from) + "'")
			        .replace("@dateTo", "'" + (StringUtils.isBlank(to) ? "" : to) + "'")
			        .replace("@locationId", "'" + (StringUtils.isBlank(locationId) ? "" : locationId) + "'");
			
			System.out.println(query);
			
			sc.close();
			
			// System.out.println(query);
			response.setContentType("application/zip");
			response.setHeader("Content-Disposition",
			    "attachment; filename=" + dataExportFileName(report, locationId, from, to) + ".csv");
			
			CSVWriter csvWriter = new CSVWriter(response.getWriter());
			
			List ol = WSContext.getCustomQueryService().getDataBySQL(query);
			List<String[]> ols = new ArrayList<>();
			
			for (Object object : ol) {
				Object[] objar = (Object[]) object;
				String[] strar = new String[objar.length];
				
				for (int i = 0; i < objar.length; i++) {
					strar[i] = (String) objar[i];
				}
				
				ols.add(strar);
			}
						
			csvWriter.writeAll(ols);
			
			csvWriter.flush();
			csvWriter.close();
		}
		catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		catch (IOException e) {
			e.printStackTrace();
		}
		
		return result;
	}
	
	public static void main(String[] args) {
		Object[] src = { "NYC", 1, true };
		
		String[] dest = new String[src.length];
		System.arraycopy(src, 0, dest, 0, src.length);
		
		System.out.println(Arrays.toString(dest));
	}
	
	private String dataExportFileName(String report, String locationId, String from, String to) {
		return report + "_" + (StringUtils.isNotBlank(locationId) ? locationId : "") + "_"
		        + (StringUtils.isNotBlank(from) ? from : "") + "_" + (StringUtils.isNotBlank(to) ? to : "") + "_"
		        + new SimpleDateFormat("yyyy-MM-dd_HHmmss").format(new Date());
	}
	
	@RequestMapping(value = "/data-aggregate", method = RequestMethod.GET)
	public @ResponseBody
	SimpleObject getReportDataAggregate(@RequestParam("reportId") String report,
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
			
			result.put("report", WSContext.getCustomQueryService().getDataBySQLMapResult(query));
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
