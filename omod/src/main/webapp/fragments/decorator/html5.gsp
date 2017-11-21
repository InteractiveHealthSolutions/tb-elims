<!DOCTYPE html>
<html class="content-loading">
	<head>
		<title>${ config.title ?: "TB eLIMS" }</title>
		<link rel="shortcut icon" type="image/ico" href="/${ ui.contextPath() }/images/openmrs-favicon.ico"/>
		<link rel="icon" type="image/png\" href="/${ ui.contextPath() }/images/openmrs-favicon.png"/>

		<link rel="stylesheet" type="text/css" href="${ ui.resourceLink("tbelims", "styles/style.css") }">
	</head>
	<body>
		<script type="text/javascript">
			var OPENMRS_CONTEXT_PATH = '${ ui.contextPath() }';
		</script>
		<script>
			/* if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('/openmrs/service-worker.js', { scope: "/openmrs/" })
				.then(function(reg) {
				  console.info('Registration succeeded. Scope is ' + reg.scope);
				}).catch(function(error) {
				  console.error('Registration failed with ' + error);
				});
			}
			else {
				alert('Offline mode is disabled or not supported by your browser');
			} */
		</script>			
			
		${ ui.resourceLinks() }
			
		<%= config.content %>

	</body>
</html>