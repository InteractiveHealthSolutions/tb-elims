package org.openmrs.module.tbelims.web.rest;

import org.openmrs.module.tbelims.Constants;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.openmrs.module.webservices.rest.web.v1_0.controller.MainResourceController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/rest/" + RestConstants.VERSION_2 + "/" + Constants.TBELIMS_MODULE_ID)
public class TBeLimsRestController extends MainResourceController {
	
	@Override
	public String getNamespace() {
		return RestConstants.VERSION_2 + "/" + Constants.TBELIMS_MODULE_ID;
	}
	
}
