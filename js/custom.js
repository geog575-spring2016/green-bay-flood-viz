//////////////////////
// global variables //
//////////////////////

var fileArray = ['data/floods/v1.geojson',
				 'data/floods/v2.geojson',
				 'data/floods/v3.geojson',
				 'data/floods/v4.geojson',
				 'data/floods/v5.geojson',
				 'data/floods/v6.geojson',
				 'data/floods/v7.geojson'];

var dikeFileArray= ['data/breakpoints.geojson',
					'data/dike.geojson'];

var lakeMIFile = 'data/LakeMichigan.geojson';

var floodDataArray = [];
var dike;
var breakPoints;
var lakeMichigan;

var currentIndex = 0,
	prevIndex = 0;


// initialize the map with geographical coordinates set on madison
var map = L.map("map",
	{
		maxBounds: new L.LatLngBounds([-20, -200],[70,-10]),

	})
	.setView([44.527676, -87.993452], 13);

//	add a tile layer to the map
var cartoDB_Map = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
	{
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		subdomains: 'abcd',
	}).addTo(map);

var HERE_hybridDay = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/hybrid.day/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
	attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
	subdomains: '1234',
	mapID: 'newest',
	app_id: '4hRsdRmGBf2l2Hn2o1ET',
	app_code: 'Am10DtpE3d21BS94dezWSg',
	base: 'aerial',
	maxZoom: 20,
	type: 'maptile',
	language: 'eng',
	format: 'png8',
	size: '256'
});

//disable drag when on info panel
$('#panel').on('mousedown dblclick', function(e)
{
	L.DomEvent.stopPropagation(e);
});

// load first flood data when page loads
$('#document').ready(function()
{
	getData();
	window.setTimeout(createFloodLevelSlider(), 200000);


});

// get the value for the begining year
$('#begin li').on('click', function()
{
	var overlay = $(this).text();
	if(overlay == 'Satellite')
	{
		addSatellite();
	}
	else if(overlay == 'Dike Breaks')
	{
		updateDikeBreaks();
	};
});

// //load first flood data when selected
// $('#fl579').click(function()
// {
// 	floodlevel = v1;
// 	getData();
// });

// //load second flood data when selected
// $('#fl582').click(function()
// {
// 	floodlevel = v2;
// 	getData();
// });

// //load third flood data when selected
// $('fl583').click(function()
// {
// 	floodlevel = v3;
// 	getData();
// });

// //load fourth flood data when selected
// $('#fl584').click(function()
// {
// 	floodlevel = v4;
// 	getData();
// });

// //load fifth flood data when selected
// $('#fl586').click(function()
// {
// 	floodlevel = v5;
// 	getData();
// });

// //load sixth flood data when selected
// $('#fl588').click(function()
// {
// 	floodlevel = v6;
// 	getData();
// });

// //load seventh flood data when selected
// $('#fl591').click(function()
// {
// 	floodlevel = v7;
// 	getData();
// });

// create the flood level slider
function createFloodLevelSlider()
{
	// set slider attributes
	$('.range-slider').attr(
	{
		max: 6,
		min: 0,
		value: 0,
		step: 1
	});


	$('.skip').click(function()
	{

	// get the old index value
	var index = $('.range-slider').val();
	prevIndex = index;

	// increment or decrement depending on button clicked
	if ($(this).attr('id') == 'forward')
	{
		index++;

		// go back to first attribute after last attribute
		index = index > 6 ? 6 : index;

	}
	else if ($(this).attr('id') == 'reverse')
	{
		index--;

		// go back to last attribute after first attribute
		index = index < 0 ? 0 : index;
	};

	// update slider
	$('.range-slider').val(index);
	currentIndex = index;


	//Update Flood Layers
	updateFloodLayers();

	});

	$('.range-slider').on('input', function()
	{
		prevIndex = currentIndex;
		currentIndex = $(this).val();

		// call update symbols
		updateFloodLayers();

	});
};
//linking buttons to overlays
$('#satellite').on('click', function()
{
		addSatellite();
});
$('#breaks').on('click', function()
{
		updateDikeBreaks();
});
function addSatellite(overlay)
{
	if(map.hasLayer(cartoDB_Map))
	{
		map.removeLayer(cartoDB_Map);
		map.removeLayer(lakeMichigan);
		HERE_hybridDay.addTo(map);
	}
	else
	{
		map.removeLayer(HERE_hybridDay);
		cartoDB_Map.addTo(map);
		lakeMichigan.addTo(map);
	};

};

function updateDikeBreaks()
{

	if(!map.hasLayer(breakPoints))
	{
		dike.addTo(map);
		breakPoints.addTo(map);
		breakPoints.eachLayer(function(layer)
		{
			if(layer.feature.properties.breakpoint != Number(currentIndex)+1)
			{
				map.removeLayer(layer)
			}
		});
	}
	else
	{
		breakPoints.eachLayer(function(layer)
		{
			if(layer.feature.properties.breakpoint == Number(currentIndex)+1)
			{
				map.addLayer(layer)
			}
			if(layer.feature.properties.breakpoint != Number(currentIndex)+1)
			{
				map.removeLayer(layer)
			}
		});
	};
};


function updateFloodLayers()
{

	var change = currentIndex - prevIndex;
	if(change > 0)
	{
		for(var i = Number(prevIndex) + 1; i <= Number(currentIndex); i++)
		{
			floodDataArray[i].addTo(map);

		};

	}
	else if(change < 0)
	{
		for(var i = Number(currentIndex) + 1; i <= Number(prevIndex); i++)
		{
			map.removeLayer(floodDataArray[i]);
		};
	};

	if(map.hasLayer(breakPoints))
	{
		updateDikeBreaks();
	};

};


function getData()
{

	$.ajax(fileArray[0],
	{
		dataType: 'json',
		success: function(response)
		{
			l1 = L.geoJson(response,
			{
				style: function (feature)
				{
					return {fillColor: '#0D6C8C', stroke: false, fillOpacity: .5};
				}
			}).addTo(map);
		}
	}).then(function() {
		floodDataArray.push(l1);
	});

	for(var i = 1; i < fileArray.length; i++)
	{
		$.ajax(fileArray[i],
		{
			dataType: 'json',
			success: function(response)
			{
				layer = L.geoJson(response,
				{
					style: function(feature)
					{
						return {fillColor: '#128AB3', stroke: false, fillOpacity: .2};
					}
				});
				floodDataArray.push(layer);
			}
		});
	};

	$.ajax(dikeFileArray[0],
	{
		dataType: 'json',
		success: function(response)
		{
			breakPoints = L.geoJson(response,
			{
				style: function (feature)
				{
					return {fill: '#755144'};
				}
			});
		}
	});

    $.ajax(dikeFileArray[1],
	{
		dataType: 'json',
		success: function(response)
		{
			dike = L.geoJson(response,
			{
				style: function (feature)
				{
					return {color: '#755144'};
				}
			});
		}
	});

  //   $.ajax(lakeMIFile,
	// {
	// 	dataType: 'json',
	// 	success: function(response)
	// 	{
	// 		lakeMichigan = L.geoJson(response,
	// 		{
	// 			style: function (feature)
	// 			{
	// 				return {fillColor: '#A9BDC4', stroke: false, fillOpacity: 0.5};
	// 			}
	// 		}).addTo(map);
	// 	}
	// });
	//


};
