<%
	ui.decorateWith("tbelims", "html5")
	
	ui.includeFragment("appui", "standardEmrIncludes")
	
	ui.includeJavascript("uicommons", "angular.js")
	ui.includeJavascript("uicommons", "angular-common.js")
	ui.includeJavascript("uicommons", "angular-resource.min.js")
	ui.includeJavascript("uicommons", "angular-common.js")
	ui.includeJavascript("uicommons", "angular-ui/angular-ui-router.min.js")
	ui.includeJavascript("tbelims", "angular-base64.min.js")
	
	ui.includeCss("tbelims", "ui-grid.min.css")
	ui.includeJavascript("tbelims", "ui-grid.min.js")
	
	ui.includeCss("tbelims", "angular-ui-tree.min.css")
	ui.includeJavascript("tbelims", "angular-ui-tree.min.js")

	ui.includeJavascript("tbelims", "services/session.js")
	ui.includeJavascript("tbelims", "services/patientService.js")
	ui.includeJavascript("tbelims", "services/locationService.js")
	ui.includeJavascript("tbelims", "services/labService.js")
	
	ui.includeJavascript("tbelims", "app.authorization.js")
	ui.includeJavascript("tbelims", "app.patient.js")
	ui.includeJavascript("tbelims", "app.location.js")
	ui.includeJavascript("tbelims", "app.lab.js")
	ui.includeJavascript("tbelims", "filter.patient.js")
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
<div class="logo">e-LIMS</div>
<div class="user-options">
	<li ng-controller="LocationController">
		<a ng-click="openTreeModal()" ng-if="!('login' | isState)" ng-init="loadTree()">
			Locations <i class="icon-home small"></i>
		</a>
	</li>
	<li ng-controller="LogoutController">
		<a ng-click="logout()">
			Logout <i class="icon-signout small"></i>
		</a>
	</li>
</div>
</li>
</header>

<div class="sidebar" ng-include="('login' | isState) ? null : '/openmrs/ms/uiframework/resource/tbelims/html/navigation.html'"></div>

<div class="body-wrapper">
	<div ui-view></div>
</div>

</div>
