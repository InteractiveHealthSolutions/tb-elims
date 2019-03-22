package org.openmrs.module.tbelims.web.controller;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class TBeLIMSLoginController {
	
	@RequestMapping(value = "login.htm", method = RequestMethod.GET)
	public void redirectLogin(HttpServletResponse response) throws IOException {
		response.sendRedirect("tbelims/app.page#/login");
	}
}
