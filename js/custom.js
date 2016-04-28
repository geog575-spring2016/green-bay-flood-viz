//////////////////////
// global variables //
//////////////////////


	// initialize the map with geographical coordinates set on madison
	var map = L.map("map",
		{
			maxBounds: new L.LatLngBounds([-20, -200],[70,-10]),

		})
		.setView([40, -95], 5);

	//	add a tile layer to the map
	var cartoDB_Map = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', 
	{
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		subdomains: 'abcd',
		maxZoom: 6
	})
	.addTo(map);







