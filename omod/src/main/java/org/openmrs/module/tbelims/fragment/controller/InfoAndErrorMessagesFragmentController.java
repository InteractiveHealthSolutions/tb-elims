package org.openmrs.module.tbelims.fragment.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.openmrs.module.tbelims.Constants;
import org.openmrs.ui.framework.fragment.FragmentModel;

public class InfoAndErrorMessagesFragmentController {
	
	public void controller(HttpServletRequest request, FragmentModel fragmentModel) {
		HttpSession session = request.getSession();
		String errorMessage = (String) session.getAttribute(Constants.SESSION_ATTRIBUTE_ERROR_MESSAGE);
		String infoMessage = (String) session.getAttribute(Constants.SESSION_ATTRIBUTE_INFO_MESSAGE);
		session.setAttribute(Constants.SESSION_ATTRIBUTE_ERROR_MESSAGE, null);
		session.setAttribute(Constants.SESSION_ATTRIBUTE_INFO_MESSAGE, null);
		fragmentModel.addAttribute("errorMessage", errorMessage);
		fragmentModel.addAttribute("infoMessage", infoMessage);
	}
	
}
