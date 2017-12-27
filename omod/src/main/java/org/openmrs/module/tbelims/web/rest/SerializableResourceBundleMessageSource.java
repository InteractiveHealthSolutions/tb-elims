package org.openmrs.module.tbelims.web.rest;

import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Properties;

/**
 * Created with IntelliJ IDEA. User: rovi Date: 30.08.13 Time: 15:42 To change this template use
 * File | Settings | File Templates.
 */
@Component
public class SerializableResourceBundleMessageSource extends ReloadableResourceBundleMessageSource {
	
	public Properties getAllProperties(Locale locale) {
		clearCacheIncludingAncestors();
		PropertiesHolder propertiesHolder = getMergedProperties(locale);
		Properties properties = propertiesHolder.getProperties();
		
		return properties;
	}
}
