package org.openmrs.module.tbelims.web.controller;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openmrs.module.tbelims.Constants;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

@Component
public class TBeLIMSStartup implements ApplicationListener<ContextRefreshedEvent> {
	
	private Log log = LogFactory.getLog(this.getClass());
	
	@Override
	public void onApplicationEvent(final ContextRefreshedEvent event) {
		log.info("Starting TBeLIMSStartupListener");
		/*try {
			File wbifDir = event.getApplicationContext().getResource("/WEB-INF").getFile();
			File serWDir = event.getApplicationContext().getResource(Constants.SERVICE_WORKER_PATH).getFile();
			
			log.info("Moving ServiceWorker to root from " + serWDir.getAbsolutePath());
			
			File baseDir = wbifDir.getParentFile();
			
			FileUtils.copyFileToDirectory(serWDir, baseDir);
		}
		catch (IOException e) {
			e.printStackTrace();
			log.error("Error while moving ServiceWorker to root. TB eLIMS may not work properly.", e);
		}*/
	}
}
