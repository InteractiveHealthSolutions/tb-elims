var CACHE_DYNAMIC = 'tbelims-dynamic-v1';
var CACHE_STATIC = 'tbelims-static-v1';

var dynamicUrlsToCache = [
  '/openmrs/',
  '/openmrs/login.htm'
];
var staticUrlsToCache = [
  '/openmrs/service-worker.js',
  '/openmrs/ms/uiframework/resource/uicommons/scripts/jquery-1.12.4.min.js',
  '/openmrs/ms/uiframework/resource/tbelims/scripts/popper.min.js',
  '/openmrs/ms/uiframework/resource/tbelims/scripts/bootstrap.min.js',
  '/openmrs/ms/uiframework/resource/uicommons/scripts/angular.js',
  '/openmrs/ms/uiframework/resource/uicommons/scripts/angular-common.js',
  '/openmrs/ms/uiframework/resource/uicommons/scripts/angular-resource.min.js',
  
  '/openmrs/ms/uiframework/resource/uicommons/scripts/services/session.js',

  '/openmrs/ms/uiframework/resource/tbelims/scripts/AuthorizationController.js',

  '/openmrs/ms/uiframework/resource/tbelims/styles/bootstrap.min.css',
  '/openmrs/ms/uiframework/resource/tbelims/styles/style.css',
  '/openmrs/ms/uiframework/resource/uicommons/styles/angular-ui/ng-grid.min.css'
];

self.addEventListener('install', function(event) {
	console.log('INSTALL'+event.request);

	event.waitUntil(
		caches.open(CACHE_DYNAMIC).then(function(cache) {
			console.log('Adding to dynamic cache');
			return cache.addAll(dynamicUrlsToCache);
		}));
	
	event.waitUntil(
		caches.open(CACHE_STATIC).then(function(cache) {
			console.log('Adding to static cache');
			return cache.addAll(staticUrlsToCache);
		}));
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', function(event) {
	// Network, then cache, then fallback for home page
	if(event.request.url.indexOf('/openmrs/ms/uiframework/resource/') === -1)  {
		event.respondWith(
			fetch(event.request).then(function(response) {
				requestToCache = event.request.clone();
				if(!response){
					return caches.match(event.request);
				}
				
				responseToCache = response.clone();
				caches.open(CACHE_DYNAMIC).then(function(cache) {
					cache.put(requestToCache, responseToCache);
				});
				return response;
			})
			.catch(function() {
				return caches.match(event.request);
			})
		);
	}
	else {
		event.respondWith(caches.match(event.request).then(
			function(response) {
				// Cache hit - return response
				if (response) {
					return response;
				}
	
				// IMPORTANT: Clone the request. A request is a stream and
				// can only be consumed once. Since we are consuming this
				// once by cache and once by the browser for fetch, we need
				// to clone the response.
				var fetchRequest = event.request.clone();
	
				return fetch(fetchRequest).then(
					function(response) {
						// Check if we received a valid response
						if (!response || response.status < 200 || response.status >= 400 
								|| response.type !== 'basic' 
								|| fetchRequest.url.indexOf('/openmrs/ms/uiframework/resource/') === -1) {
							return response;
						}
	
						// IMPORTANT: Clone the response. A response is a stream
						// and because we want the browser to consume the response
						// as well as the cache consuming the response, we need
						// to clone it so we have two streams.
						var responseToCache = response.clone();
	
						caches.open(CACHE_STATIC).then(function(cache) {
							cache.put(event.request, responseToCache);
						});
	
						return response;
					});
			}));
	}
});