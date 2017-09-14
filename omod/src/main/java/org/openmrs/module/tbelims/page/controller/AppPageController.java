package org.openmrs.module.tbelims.page.controller;

import static org.openmrs.module.tbelims.Constants.REQUEST_PARAMETER_NAME_REDIRECT_URL;
import static org.openmrs.module.tbelims.Constants.SESSION_ATTRIBUTE_REDIRECT_URL;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openmrs.api.LocationService;
import org.openmrs.api.context.Context;
import org.openmrs.api.context.ContextAuthenticationException;
import org.openmrs.module.ModuleUtil;
import org.openmrs.module.appframework.service.AppFrameworkService;
import org.openmrs.module.appui.AppUiConstants;
import org.openmrs.module.appui.UiSessionContext;
import org.openmrs.module.tbelims.Constants;
import org.openmrs.ui.framework.UiUtils;
import org.openmrs.ui.framework.annotation.SpringBean;
import org.openmrs.ui.framework.page.PageModel;
import org.openmrs.ui.framework.page.PageRequest;
import org.openmrs.util.OpenmrsClassLoader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;

/**
 * Copied from referenceapplication LoginController with no changes
 */
public class AppPageController {
	
	protected final Log log = LogFactory.getLog(getClass());
	
	@RequestMapping("/login.htm")
	public String overrideLoginpage() {
		//TODO The referer should actually be captured from here since we are doing a redirect
		return "redirect:/tbelims/app.page";
	}
	
	/**
	 * @should redirect the user to the home page if they are already authenticated
	 * @should show the user the login page if they are not authenticated
	 * @should set redirectUrl in the page model if any was specified in the request
	 * @should set the referer as the redirectUrl in the page model if no redirect param exists
	 * @should set redirectUrl in the page model if any was specified in the session
	 * @should not set the referer as the redirectUrl in the page model if referer URL is outside
	 *         context path
	 * @should set the referer as the redirectUrl in the page model if referer URL is within context
	 *         path
	 */
	public void get(PageModel model, UiUtils ui, PageRequest pageRequest,
	        @SpringBean("appFrameworkService") AppFrameworkService appFrameworkService, HttpServletRequest request,
	        HttpServletResponse response) {
		
		//response.setHeader("Service-Worker-Allowed", "/openmrs/");
		
		if (Context.isAuthenticated()) {
			//TODO return "forward:" + ui.pageLink(Constants.TBELIMS_MODULE_ID, "app");
		}
		
		String redirectUrl = getStringSessionAttribute(SESSION_ATTRIBUTE_REDIRECT_URL, pageRequest.getRequest());
		if (StringUtils.isBlank(redirectUrl))
			redirectUrl = pageRequest.getRequest().getParameter(REQUEST_PARAMETER_NAME_REDIRECT_URL);
		
		if (StringUtils.isBlank(redirectUrl)) {
			redirectUrl = getRedirectUrlFromReferer(pageRequest);
		}
		
		if (redirectUrl == null)
			redirectUrl = "";
		
		model.addAttribute(REQUEST_PARAMETER_NAME_REDIRECT_URL, redirectUrl);
	}
	
	private String getRedirectUrlFromReferer(PageRequest pageRequest) {
		String referer = pageRequest.getRequest().getHeader("Referer");
		String redirectUrl = "";
		if (referer != null) {
			if (referer.contains("http://") || referer.contains("https://")) {
				try {
					URL refererUrl = new URL(referer);
					String refererPath = refererUrl.getPath();
					String refererContextPath = refererPath.substring(0, refererPath.indexOf('/', 1));
					if (StringUtils.equals(pageRequest.getRequest().getContextPath(), refererContextPath)) {
						redirectUrl = refererPath;
					}
				}
				catch (MalformedURLException e) {
					log.error(e.getMessage());
				}
			} else {
				redirectUrl = pageRequest.getRequest().getHeader("Referer");
			}
		}
		return StringEscapeUtils.escapeHtml(redirectUrl);
	}
	
	/**
	 * Processes requests to authenticate a user
	 * 
	 * @param username
	 * @param password
	 * @param sessionLocationId
	 * @param locationService
	 * @param ui {@link UiUtils} object
	 * @param pageRequest {@link PageRequest} object
	 * @param sessionContext
	 * @return
	 * @should redirect the user back to the redirectUrl if any
	 * @should redirect the user to the home page if the redirectUrl is the login page
	 * @should send the user back to the login page if an invalid location is selected
	 * @should send the user back to the login page when authentication fails
	 */
	public String post(@RequestParam(value = "username", required = false) String username,
	        @RequestParam(value = "password", required = false) String password,
	        @RequestParam(value = "sessionLocation", required = false) Integer sessionLocationId,
	        @SpringBean("locationService") LocationService locationService, UiUtils ui, PageRequest pageRequest,
	        UiSessionContext sessionContext) {
		
		String redirectUrl = pageRequest.getRequest().getParameter(REQUEST_PARAMETER_NAME_REDIRECT_URL);
		redirectUrl = getRelativeUrl(redirectUrl, pageRequest);
		
		try {
			Context.authenticate(username, password);
			
			if (Context.isAuthenticated()) {
				if (log.isDebugEnabled())
					log.debug("User has successfully authenticated");
				
				//TODO ??????????????????????????????????????/
				//sessionContext.setSessionLocation(sessionLocation);
				
				// set the locale based on the user's default locale
				
				Locale userLocale = Context.getLocale();
				if (userLocale != null) {
					Context.getUserContext().setLocale(userLocale);
					pageRequest.getResponse().setLocale(userLocale);
					new CookieLocaleResolver().setDefaultLocale(userLocale);
				}
				
				if (StringUtils.isNotBlank(redirectUrl)) {
					//don't redirect back to the login page on success nor an external url
					if (!redirectUrl.contains("login.")) {
						if (log.isDebugEnabled())
							log.debug("Redirecting user to " + redirectUrl);
						
						return "redirect:" + redirectUrl;
					} else {
						if (log.isDebugEnabled())
							log.debug("Redirect contains 'login.', redirecting to home page");
					}
				}
				
				return "redirect:" + ui.pageLink(Constants.TBELIMS_MODULE_ID, "home");
			}
		}
		catch (ContextAuthenticationException ex) {
			if (log.isDebugEnabled())
				log.debug("Failed to authenticate user");
			
			pageRequest.getSession().setAttribute("infoAndErrorMessages",
			    ui.message(Constants.TBELIMS_MODULE_ID + ".error.login.fail"));
		}
		
		if (log.isDebugEnabled())
			log.debug("Sending user back to login page");
		
		//TODO limit login attempts by IP Address
		
		pageRequest.getSession().setAttribute(SESSION_ATTRIBUTE_REDIRECT_URL, redirectUrl);
		
		return "redirect:" + ui.pageLink(Constants.TBELIMS_MODULE_ID, "login");
	}
	
	private String getStringSessionAttribute(String attributeName, HttpServletRequest request) {
		Object attributeValue = request.getSession().getAttribute(attributeName);
		if (attributeValue == null) {
			return null;
		}
		request.getSession().removeAttribute(attributeName);
		return attributeValue.toString();
	}
	
	public String getRelativeUrl(String url, PageRequest pageRequest) {
		if (url == null)
			return null;
		
		if (url.startsWith("/") || (!url.startsWith("http://") && !url.startsWith("https://"))) {
			return url;
		}
		
		//This is an absolute url, discard the protocal, domain name/host and port section
		int indexOfContextPath = url.indexOf(pageRequest.getRequest().getContextPath());
		if (indexOfContextPath >= 0) {
			url = url.substring(indexOfContextPath);
			log.debug("Relative redirect:" + url);
			
			return url;
		}
		
		return null;
	}
}
