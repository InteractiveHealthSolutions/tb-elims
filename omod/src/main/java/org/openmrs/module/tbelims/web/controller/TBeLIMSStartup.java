package org.openmrs.module.tbelims.web.controller;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openmrs.module.tbelims.Constants;
import org.openmrs.util.OpenmrsUtil;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

@Component
public class TBeLIMSStartup implements ApplicationListener<ContextRefreshedEvent> {
	
	private Log log = LogFactory.getLog(this.getClass());
	
	@Override
	public void onApplicationEvent(final ContextRefreshedEvent event) {
		log.info("Starting TBeLIMSStartupListener");
		Properties prop = OpenmrsUtil.getRuntimeProperties(event.getApplicationContext().getApplicationName());
		
		String customindex = prop.getProperty("custom.login.jsp.file");
		try {
			if (customindex == null) {
				prop.put("custom.login.jsp.file", "/WEB-INF/view/module/" + Constants.TBELIMS_MODULE_ID + "/tbelims.jsp");
				prop.store(
				    new FileOutputStream(OpenmrsUtil.getRuntimePropertiesFilePathName(event.getApplicationContext()
				            .getApplicationName())), null);
			}
			
			File wbiflgin = event.getApplicationContext().getResource("/WEB-INF/view/portlets/welcome.jsp").getFile();
			if (wbiflgin.exists()) {
				FileOutputStream fop = new FileOutputStream(wbiflgin);
				fop.write(("<script>window.location='${pageContext.request.contextPath}/tbelims/app.page#/login';</script>")
				        .getBytes());
				fop.flush();
				fop.close();
			}
		}
		catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		catch (IOException e) {
			e.printStackTrace();
		}
		//		try {
		//			File wbifDir = event.getApplicationContext().getResource("/WEB-INF").getFile();
		//			File serWDir = event.getApplicationContext().getResource(Constants.SERVICE_WORKER_PATH).getFile();
		//			
		//			log.info("Moving ServiceWorker to root from " + serWDir.getAbsolutePath());
		//			
		//			File baseDir = wbifDir.getParentFile();
		//			
		//			FileUtils.copyFileToDirectory(serWDir, baseDir);
		//		}
		//		catch (IOException e) {
		//			e.printStackTrace();
		//			log.error("Error while moving ServiceWorker to root. TB eLIMS may not work properly.", e);
		//		}
	}
}
