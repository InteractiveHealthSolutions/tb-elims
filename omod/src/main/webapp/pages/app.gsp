<%
	ui.decorateWith("tbelims", "html5")
	
	ui.includeFragment("appui", "standardEmrIncludes")
	
	ui.includeJavascript("uicommons", "angular.js")
	ui.includeJavascript("uicommons", "angular-common.js")
	ui.includeJavascript("uicommons", "angular-resource.min.js")
	ui.includeJavascript("uicommons", "angular-ui/angular-ui-router.min.js")
	ui.includeJavascript("tbelims", "angular-base64.min.js")
	ui.includeJavascript("tbelims", "angular-translate.min.js")
	ui.includeJavascript("tbelims", "angular-translate-loader-url.min.js")
	
	ui.includeCss("tbelims", "ui-grid.min.css")
	ui.includeJavascript("tbelims", "ui-grid.min.js")
	
	ui.includeCss("tbelims", "angular-ui-tree.min.css")
	ui.includeJavascript("tbelims", "angular-ui-tree.min.js")

	ui.includeJavascript("tbelims", "services/session.js")
	ui.includeJavascript("tbelims", "services/patientService.js")
	ui.includeJavascript("tbelims", "services/locationService.js")
	ui.includeJavascript("tbelims", "services/roleService.js")
	ui.includeJavascript("tbelims", "services/userService.js")
	ui.includeJavascript("tbelims", "services/privilegeService.js")
	ui.includeJavascript("tbelims", "services/personAttributeTypeService.js")
	
	
	ui.includeJavascript("tbelims", "app.authorization.js")
	ui.includeJavascript("tbelims", "app.patient.js")
	ui.includeJavascript("tbelims", "app.location.js")
	ui.includeJavascript("tbelims", "app.lab.js")
	ui.includeJavascript("tbelims", "app.role.js")
	ui.includeJavascript("tbelims", "app.user.js")
	ui.includeJavascript("tbelims", "filter.person.js")
	ui.includeJavascript("tbelims", "filter.location.js")
	
	ui.includeCss("uicommons", "angular-ui/ng-grid.min.css")
	ui.includeCss("tbelims", "ui-bootstrap-3.3.7.min.css")
	ui.includeJavascript("tbelims", "ui-bootstrap-tpls-2.5.0.min.js")
	
	ui.includeJavascript("tbelims", "app.js")
%>

${ ui.includeFragment("tbelims", "infoAndErrorMessages") }

<script>

jQuery( document ).ready(function() {
	jQuery("link[href*='referenceapplication.css']").remove();
});

</script>

<div ng-app="app.tbelims">

<style>
.nav, .pagination, .carousel, .panel-title a { cursor: pointer; }
</style>

<header>
<div class="logo"><img ng-if="('login' | isState) ? false : true" src="/openmrs/ms/uiframework/resource/tbelims/images/logohorizontal.png"></div>
<div class="user-options">
<!-- Loading locations of type division and district to make sure these are already available in pages when rendered -->
	<li ng-controller="LocationController" ng-if="!('login' | isState)" ng-init="loadLocations(true, ['division','district'])">

	</li>
	<li ng-controller="LogoutController">
		<a ng-if="('login' | isState) ? false : true" ng-click="logout()">
			Logout <i class="icon-signout small"></i>
		</a>
	</li>
	<li><select ng-model="locale" ng-change="changeLanguage(locale);">
			<option>en</option>
			<option>de</option>
		</select>
	</li>
</div>
</li>
</header>

<div class="sidebar" ng-include="('login' | isState) ? null : '/openmrs/ms/uiframework/resource/tbelims/html/navigation.html'"></div>

<div class="body-wrapper">
	<div ui-view></div>
</div>

</div>
