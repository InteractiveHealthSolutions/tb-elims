package org.openmrs.module.tbelims.web.rest;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.ResourceBundle;

import org.openmrs.module.tbelims.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.MessageSourceResourceBundle;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created with IntelliJ IDEA. User: rovi Date: 30.08.13 Time: 15:57 To change this template use
 * File | Settings | File Templates.
 */
@Controller
@RequestMapping("/data/rest/" + Constants.TBELIMS_MODULE_ID + "/localization")
public class SerializableMessageBundleController {
	
	@Autowired
	SerializableResourceBundleMessageSource messageBundle;
	
	/**
	 * ReadAll
	 */
	@RequestMapping(value = "/messages.json", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, String> list(@RequestParam("lang") String lang) {
		System.out.println("Returning messages for " + lang);
		ResourceBundle resb = MessageSourceResourceBundle.getBundle("messages", Locale.forLanguageTag(lang));
		
		Map<String, String> pmap = new HashMap<>();
		for (String k: resb.keySet()){
			pmap.put(k, resb.getString(k));
		}
		return pmap;
	}
}
