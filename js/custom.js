//////////////////////
// global variables //
//////////////////////

//file path variables
var fileArray = ['data/floods/v1.geojson',
				 'data/floods/v2.geojson',
				 'data/floods/v3.geojson',
				 'data/floods/v4.geojson',
				 'data/floods/v5.geojson',
				 'data/floods/v6.geojson',
				 'data/floods/v7.geojson'];

var dikeFileArray= ['data/breakpoints.geojson',
					'data/manuallyClippedDike.geojson'];

//map layer variables
var floodDataArray = [];
var dike;
var baseDike;
var breakPoints;

//variables to control map interactions
var currentIndex = 0,
	prevIndex = 0;

var currentLayer = 'lakes';
// var hasBreakPoints = false;

//setting zoom and pan bounds 
var topleft = L.latLng(44.695755, -88.260835),
  	bottomright = L.latLng(44.378889, -87.710832),
  	bounds = L.latLngBounds(topleft, bottomright);

// initialize the map with geographical coordinates set on madison
var map = L.map("map",
	{
		// maxBounds: new L.LatLngBounds([-20, -200],[70,-10]),
		minZoom: 12,
		maxZoom: 18,
		maxBounds: bounds
	})
	.setView([44.527676, -87.993452], 13);

map.removeControl(map.zoomControl);

new L.Control.Zoom({ position: 'topright' }).addTo(map);


//streets tileset
var cartoDB_Map = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
	{
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		subdomains: 'abcd',
	}).addTo(map);

//satellite tileset
var HERE_hybridDay = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/hybrid.day/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
	attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
	subdomains: '1234',
	mapID: 'newest',
	app_id: '4hRsdRmGBf2l2Hn2o1ET',
	app_code: 'Am10DtpE3d21BS94dezWSg',
	base: 'aerial',
	maxZoom: 18,
	minZoom: 12,
	type: 'maptile',
	language: 'eng',
	format: 'png8',
	size: '256'
}).setOpacity(0).addTo(map);




//////////////////////
////// Doc Setup /////
//////////////////////

// load first flood data when page loads
$('#document').ready(function()
{
	getData();
	createFloodLevelSlider();
	createOpacitySlider();
});


//disable drag when on info panel
$('.panel').on('mousedown dblclick', function(e)
{
	L.DomEvent.stopPropagation(e);
});




//////////////////////
/////// Buttons //////
//////////////////////


//reset to map load state
$('#reset').on('click', function() 
{
	resetFloods();
	resetOpacitySlider()
	turnOnFloods();
});


//readd the number of flood levels based on current index
function resetFloods()
{
	currentLayer = 'lakes';
	currentIndex = 0;
	prevIndex = 0;

	removeExtraLayers();

	//add the first layer style
	// floodDataArray[0].addTo(map);
	// floodDataArray[0].eachLayer(function(layer)
	// {
	// 	console.log('adsfjk')
	// 	layer.setStyle({color: 'blue', opacity: .5});
	// });

	$('#range').val(0);

};


$('#breaks').on('click', function()
{
	turnOnFloods();
	updateDikeBreaks();
	map.on('zoomend ', function(e) 
	{
         if ( map.getZoom() > 15 ){ dike.setStyle({weight: 4})}
         else if ( map.getZoom() <= 15 ){ dike.setStyle({weight: 2})}
    });
});

//load sovi when clicked
$('#SOVI').click(function() 
{
	currentLayer = 'sovi'; 
	loadSOVI();
	
});

//load businesses
$('#BLS').click(function() 
{
	currentLayer = 'bls'; 
	loadBLS();
	
});

//load population affected
$('#affectedPop').click(function() 
{
	currentLayer = 'affectedPop'; 
	loadAffectedPopulation();
	
});

//load property loss
$('#propertyLost').click(function() 
{
	currentLayer = 'propertyLost'; 
	loadPropertyLoss();
	
});

//load median income
$('#medianIncome').click(function() 
{
	currentLayer = 'medianIncome'; 
	loadMedianIncome();
	
});



//////////////////////
/////////Slider///////
//////////////////////

// create the flood level slider
function createFloodLevelSlider()
{
	// set slider attributes
	$('#range').attr(
	{
		max: 6,
		min: 0,
		value: 0,
		step: 1
	});


	$('.skip').click(function()
	{

	// get the old index value
	var index = $('#range').val();
	prevIndex = index;

	// increment or decrement depending on button clicked
	if ($(this).attr('id') == 'forward')
	{
		index++;

		//limit the index from moving past 6
		index = index > 6 ? 6 : index;

	}
	else if ($(this).attr('id') == 'reverse')
	{
		index--;

		//limit the index from going past 0
		index = index < 0 ? 0 : index;
	};

	// update slider
	$('#range').val(index);
	currentIndex = index;


	//Update Flood Layers
	updateFloodLayers();

	});

	$('#range').on('input', function()
	{
		prevIndex = currentIndex;
		currentIndex = $(this).val();

		// call update layers
		updateFloodLayers();

	});
};

/////////////////////////////
/////// Satellite Slider ////
/////////////////////////////

function resetOpacitySlider ()
{
	HERE_hybridDay.setOpacity(0);
	$('#OPslide').val(0)
};


function createOpacitySlider()
{
	$('#OPslide').attr(
	{
		max: 1,
		min: 0,
		value: 0,
		step: .1
	});

	$('#OPslide').on('input', function()
	{
		var value = $('#OPslide').val();
		HERE_hybridDay.setOpacity(value);
		if(map.hasLayer(dike))
		{
			dike.eachLayer(function(layer)
			{
				if(value > .7)
				{
					layer.setStyle({color: '#eee'});
				}
				else
				{
					layer.setStyle({color: '#333'});
				}
			});
		}
	});
};



//////////////////////
/////Flood Levels/////
//////////////////////


function updateFloodLayers()
{

	var change = currentIndex - prevIndex;

	//slider has moved forward
	//add number of layers that the slider has moved
	if(change > 0)
	{
		for(var i = Number(prevIndex) + 1; i <= Number(currentIndex); i++)
		{
			floodDataArray[i].addTo(map);

		};

	}

	//slider has moved backwards
	//remove number of layers that slider has moved
	else if(change < 0)
	{
		for(var i = Number(currentIndex) + 1; i <= Number(prevIndex); i++)
		{
			map.removeLayer(floodDataArray[i]);
		};
	};

	//check whether map has breakpoints
	//update if they're found
	if(map.hasLayer(dike))
	{
		updateDikeBreaks();
	};

	if(currentLayer != 'lakes')
	{
		switch(currentLayer) 
		{
			case 'sovi': loadSOVI(); break;
			case 'bls': loadBLS(); break;
			case 'affectedPop': loadAffectedPopulation(); break;
			case 'propertyLost': loadPropertyLoss(); break;
			case 'medianIncome': loadMedianIncome(); break;
		};
	};

};

function turnOnFloods() 
{
	currentLayer = 'lakes';

	map.removeLayer(floodDataArray[currentIndex]);

	floodDataArray[0].addTo(map);
	floodDataArray[0].eachLayer(function(layer)
	{
		layer.setStyle({fillColor: '#128AB3', stroke: false, fillOpacity: .5});
	});

	//restylize each layer in floods
	for(var i = 1; i < floodDataArray.length; i++)
	{
		floodDataArray[i].eachLayer(function(layer)
		{
			layer.setStyle({fillColor: '#128AB3', stroke: false, fillOpacity: .2});
		});
	};

	//add floods up to current index
	for(var i = 1; i <= Number(currentIndex); i++)
	{
		floodDataArray[i].addTo(map);
	};

};



//////////////////////
///////Overlays///////
//////////////////////


function updateDikeBreaks()
{

	if(!map.hasLayer(baseDike))
	{
		baseDike.addTo(map);
	};

	dike.addTo(map);
	dike.eachLayer(function(layer)
	{
		if(layer.feature.properties.Name == Number(currentIndex)+1)
		{
			layer.addTo(map);
		};
		if(layer.feature.properties.Name != Number(currentIndex)+1)
		{
			map.removeLayer(layer)
		};
	});
	// if(!map.hasLayer(breakPoints))
	// {
	// 	// dike.addTo(map);
	// 	breakPoints.addTo(map);
	// 	breakPoints.eachLayer(function(layer)
	// 	{
	// 		if(layer.feature.properties.breakpoint != Number(currentIndex)+1)
	// 		{
	// 			map.removeLayer(layer)
	// 		}
	// 	});
	// }
	// else
	// {
	// 	breakPoints.eachLayer(function(layer)
	// 	{
	// 		if(layer.feature.properties.breakpoint == Number(currentIndex)+1)
	// 		{
	// 			map.addLayer(layer)
	// 		}
	// 		if(layer.feature.properties.breakpoint != Number(currentIndex)+1)
	// 		{
	// 			map.removeLayer(layer)
	// 		}
	// 	});
	// };
};


//remove all layers except the basemap
function removeExtraLayers()
{
	map.eachLayer(function(layer)
	{
		// if(layer._leaflet_id != 22 && layer._leaflet_id != 14496)
		
			map.removeLayer(layer);
		
	});
			cartoDB_Map.addTo(map);
			HERE_hybridDay.addTo(map);
};


function loadSOVI() 
{
	
	//style and info variables
	var colorArray = ['#ddd', '#fb6a4a', '#de2d26', '#a50f15'];
	var breakArray = ['No Data', 'Low', 'Medium', 'High'];
	var description = 'This is informatoin about SOVI'

	removeExtraLayers();

	floodDataArray[currentIndex].addTo(map);

	floodDataArray[currentIndex].eachLayer(function(layer)
	{
		
		var soviIndex = layer.feature.properties.SOVI_3CL;

		//no data
		if(!soviIndex)
		{
			layer.setStyle({fillColor: '#ddd', fillOpacity: .7, stroke: false});	
		}
		
		//sovi classes
		switch(soviIndex)
		{
			case 'Low': layer.setStyle({fillColor: colorArray[0], fillOpacity: .8, stroke: false}); break;
			case 'Medium': layer.setStyle({fillColor: colorArray[1], fillOpacity: .8, stroke: false}); break;
			case 'High': layer.setStyle({fillColor: colorArray[2], fillOpacity: .8, stroke: false}); break;
		};

	});

	createLegend(colorArray, breakArray, description);
};

//load the business at risk data
function loadBLS() 
{

	var colorArray = ['#ddd', '#c994c7', '#df65b0', '#e7298a', '#980043'];
	var classBreaks = ['No Data', '<100', '100 - 499', '500 - 999', '>1,000'];
	var description = 'This is an explanation of BLS'

	removeExtraLayers()

	floodDataArray[currentIndex].addTo(map);

	floodDataArray[currentIndex].eachLayer(function(layer)
	{
		
		var blsIndex = layer.feature.properties.EMPLOYMENT;

		//nodata
		if(!blsIndex)
		{
			layer.setStyle({fillColor: colorArray[0], fillOpacity: .7, stroke: false});	
		}
		
		//bls classes
		switch(blsIndex)
		{
			case '<100': layer.setStyle({fillColor: colorArray[1], fillOpacity: .7, stroke: false}); break;
			case '100-499': layer.setStyle({fillColor: colorArray[2], fillOpacity: .7, stroke: false}); break;
			case '500-999': layer.setStyle({fillColor: colorArray[3], fillOpacity: .7, stroke: false}); break;
			case '1,000 or Greater': layer.setStyle({fillColor: colorArray[4], fillOpacity: .7, stroke: false}); break;
			case 'Suppressed': layer.setStyle({fillColor: colorArray[0], fillOpacity: .7, stroke: false}); break;
		};

	});

	createLegend(colorArray, classBreaks, description);
};


//load the number of people affected
function loadAffectedPopulation() 
{

	var colorArray = ['#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'];
	var classBreaks = ['<500', '500 - 1,000', '1,000 - 1,500', '1,500 - 2,000', '2,000 - 2,500', '>2,500'];
	var description = 'A description of the affected population';

	//remove all the layers
	removeExtraLayers()

	//add back only the current layer
	floodDataArray[currentIndex].addTo(map);

	//stylize each layer
	floodDataArray[currentIndex].eachLayer(function(layer)
	{
		
		// console.log(layer.feature.properties.TOTAL_PEOP)
		var popIndex = layer.feature.properties.TOTAL_PEOP;

		//nodata
		// if(!popIndex)
		// {
		// 	layer.setStyle({fillColor: '#ddd', fillOpacity: .5, stroke: false});	
		// }
		
		//affected pop classes
		if(popIndex < 500)
		{ 
			layer.setStyle({fillColor: colorArray[0], fillOpacity: .8, stroke: false}); 
		}
		else if(popIndex < 1000)
		{
			layer.setStyle({fillColor: colorArray[1], fillOpacity: .8, stroke: false}); 
		}
		else if(popIndex < 1500)
		{
			layer.setStyle({fillColor: colorArray[2], fillOpacity: .8, stroke: false});
		}
		else if(popIndex < 2000)
		{
			layer.setStyle({fillColor: colorArray[3], fillOpacity: .8, stroke: false});
		}
		else if(popIndex < 2500)
		{
			layer.setStyle({fillColor: colorArray[4], fillOpacity: .8, stroke: false});
		}
		else
		{
			layer.setStyle({fillColor: colorArray[5], fillOpacity: .5, stroke: false});
		}

	});

	createLegend(colorArray, classBreaks, description);
};

//load property lost
function loadPropertyLoss() 
{

	var colorArray = ['#ddd', '#fdd0a2', '#fdae6b', '#fd8d3c', '#e6550d', '#a63603'];
	var classBreaks = ['$0', '?-$1.6 million', '$1.6 - $11 million', '$11 - $23 million', '$82 - $152 million', '>$152 million'];
	var description = 'A description of maximum property loss';

	//remove all the layers
	removeExtraLayers()

	//add back only the current layer
	floodDataArray[currentIndex].addTo(map);

	//stylize each layer
	floodDataArray[currentIndex].eachLayer(function(layer)
	{
		
		var propIndex = layer.feature.properties.MAX_PROPER;
		
		//affected pop classes
		if(propIndex == 0)
		{
			layer.setStyle({fillColor: colorArray[0], fillOpacity: .8, stroke: false});	
		}
		else if(propIndex < 1600000)
		{ 
			layer.setStyle({fillColor: colorArray[1], fillOpacity: .8, stroke: false}); 
		}
		else if(propIndex < 11000000)
		{
			layer.setStyle({fillColor: colorArray[2], fillOpacity: .8, stroke: false}); 
		}
		else if(propIndex < 23000000)
		{
			layer.setStyle({fillColor: colorArray[3], fillOpacity: .8, stroke: false});
		}
		else if(propIndex < 82000000)
		{
			layer.setStyle({fillColor: colorArray[4], fillOpacity: .8, stroke: false});
		}
		else if(propIndex < 152000000)
		{
			layer.setStyle({fillColor: colorArray[5], fillOpacity: .8, stroke: false});
		};
		// else
		// {
		// 	layer.setStyle({fillColor: '#a63603', fillOpacity: .8, stroke: false});
		// }

	});

	createLegend(colorArray, classBreaks, description);
};

//load median income
function loadMedianIncome() 
{

	var colorArray = ['#ddd', '#fdae6b', '#fdae6b', '#f16913', '#d94801', '#a63603'];
	var classBreaks = ['$0', '?-$34,000', '$34,000 - $42,000', '$42,000 - $55,000', '$55,000 - $73,000', '$73,000 - $99,000', '>$99,000'];
	var description = 'A description of median income';

	//remove all the layers
	removeExtraLayers()

	//add back only the current layer
	floodDataArray[currentIndex].addTo(map);

	//stylize each layer
	floodDataArray[currentIndex].eachLayer(function(layer)
	{
		
		var incomeIndex = layer.feature.properties.MEDIAN_INC;

		//income of 0
		if(incomeIndex == 0)
		{
			layer.setStyle({fillColor: colorArray[0], fillOpacity: .8, stroke: false});	
		}
		else if(incomeIndex < 34000)
		{ 
			layer.setStyle({fillColor: colorArray[1], fillOpacity: .8, stroke: false}); 
		}
		else if(incomeIndex < 42000)
		{
			layer.setStyle({fillColor: colorArray[2], fillOpacity: .8, stroke: false}); 
		}
		else if(incomeIndex< 55000)
		{
			layer.setStyle({fillColor: colorArray[3], fillOpacity: .8, stroke: false});
		}
		else if(incomeIndex < 73000)
		{
			layer.setStyle({fillColor: colorArray[4], fillOpacity: .8, stroke: false});
		}
		else if(incomeIndex < 99000)
		{
			layer.setStyle({fillColor: colorArray[5], fillOpacity: .8, stroke: false});
		}
		// else
		// {
		// 	layer.setStyle({fillColor: '#67000d', fillOpacity: .8, stroke: false});
		// }

	});

	createLegend(colorArray, classBreaks, description);
};



//////////////////////
/////////Legend///////
//////////////////////

function createLegend(colors, breaks, description)
{
	$('#legendText').html(description);
	
	// var svg = '<svg id="attribute-legend" width="200px">';

	// for(var i = 0; i < colors.length; i++)
	// {
	//     svg += '<circle class="legend-circle" fill="yellow" fill-opacity="0" stroke="#FFF" r="10" cx="58" cy="' + (i + 10) * 10 + '"/><text fill="yellow">"banagas"</text>';
	// };

	$('#replace').remove();
	$('#colorLegend').append('<div id="replace" style="text-align: left">');

	// if(currentLayer == 'sovi' || currentLayer == 'bls')
	// {
		for(var i = colors.length - 1; i >= 0; i--)
		{
			$('#replace').append('<span><hr class="lineBreak"><div style="float: left; display: inline-block; width:20px; height:20px; background-color:' + colors[i] + '"></div><div class="legendSpacer" style="width:10px; display: inline-block"></div>'+breaks[i]+ '</span>')
		};
	// }
	// else 
	// {
	// 	for(var i = colors.length - 1; i >= 0; i--)
	// 	{
	// 		$('#replace').append('<span><hr><div style="float: left; display: inline-block; width:20px; height:20px; background-color:' + colors[i] + '"></div><div class="legendSpacer" style="width:10px; display: inline-block"></div>'+breaks[i]+'-'+breaks[i-1]+ '</span>')
	// 	};
	// }




	

};


//////////////////////
///////Data Call//////
//////////////////////


//get the map data
function getData()
{
	//flood level 1
	$.ajax(fileArray[0],
	{
		dataType: 'json',
		success: function(response)
		{
			floodDataArray[0] = L.geoJson(response,
			{
				style: function (feature)
				{
					return {fillColor: '#0D6C8C', stroke: false, fillOpacity: .5, clickable: false};
				}
			}).addTo(map);
		}
	});

	//dike
    $.ajax(dikeFileArray[1],
	{
		dataType: 'json',
		success: function(response)
		{
			dike = L.geoJson(response,
			{
				style: function (feature)
				{
					return {color: '#333', weight: 2, opacity: 1, clickable: false};
				}
			});
			baseDike = L.geoJson(response,
			{
				style: function (feature)
				{
					return {color: 'red', weight: 1, opacity: 1, clickable: false};
				}
			});
		}
	});

	//flood level 2
	$.ajax(fileArray[1],
	{
		dataType: 'json',
		success: function(response)
		{
			floodDataArray[1] = L.geoJson(response,
			{
				style: function (feature)
				{
					return {fillColor: '#0D6C8C', stroke: false, fillOpacity: .2, clickable: false};
				}
			});
		}
	});


	//flood level 3
	$.ajax(fileArray[2],
	{
		dataType: 'json',
		success: function(response)
		{
			floodDataArray[2] = L.geoJson(response,
			{
				style: function (feature)
				{
					return {fillColor: '#0D6C8C', stroke: false, fillOpacity: .2, clickable: false};
				}
			});
		}
	});

	//flood level 4
	$.ajax(fileArray[3],
	{
		dataType: 'json',
		success: function(response)
		{
			floodDataArray[3] = L.geoJson(response,
			{
				style: function (feature)
				{
					return {fillColor: '#0D6C8C', stroke: false, fillOpacity: .2, clickable: false};
				}
			});
		}
	});

	//flood level 5
	$.ajax(fileArray[4],
	{
		dataType: 'json',
		success: function(response)
		{
			floodDataArray[4] = L.geoJson(response,
			{
				style: function (feature)
				{
					return {fillColor: '#0D6C8C', stroke: false, fillOpacity: .2, clickable: false};
				}
			});
		}
	});

	//flood level 6
	$.ajax(fileArray[5],
	{
		dataType: 'json',
		success: function(response)
		{
			floodDataArray[5] = L.geoJson(response,
			{
				style: function (feature)
				{
					return {fillColor: '#0D6C8C', stroke: false, fillOpacity: .2, clickable: false};
				}
			});
		}
	});

	//flood level 7
	$.ajax(fileArray[6],
	{
		dataType: 'json',
		success: function(response)
		{
			floodDataArray[6] = L.geoJson(response,
			{
				style: function (feature)
				{
					return {fillColor: '#0D6C8C', stroke: false, fillOpacity: .2, clickable: false};
				}
			});
		}
	});

	//flood levels 2-7
	// for(var i = 1; i < fileArray.length; i++)
	// {
	// 	$.ajax(fileArray[i],
	// 	{
	// 		dataType: 'json',
	// 		success: function(response)
	// 		{
	// 			layer = L.geoJson(response,
	// 			{
	// 				style: function(feature)
	// 				{
	// 					return {fillColor: '#128AB3', stroke: false, fillOpacity: .2, clickable: false};
	// 				}
	// 			});		
	// 		}
	// 	}).then(function() {
	// 		floodDataArray.splice(i,) = layer;
	// 	});;
	// };


	//breakpoints
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
};
