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
					'data/dike.geojson'];

var lakeMIFile = 'data/LakeMichigan.geojson';

//map layer variables
var floodDataArray = [];
var dike;
var breakPoints;

//variables to control map interactions
var currentIndex = 0,
	prevIndex = 0;

var currentLayer = 'lakes';
// var hasBreakPoints = false;

//setting zoom and pan bounds 
var topleft = L.latLng(44.6362, -88.1433),
  	bottomright = L.latLng(44.4637, -87.8268
),
  	bounds = L.latLngBounds(topleft, bottomright);

// initialize the map with geographical coordinates set on madison
var map = L.map("map",
	{
		// maxBounds: new L.LatLngBounds([-20, -200],[70,-10]),
		minZoom: 12,
		maxZoom: 16,
		maxBounds: bounds
	})
	.setView([44.527676, -87.993452], 13);


//streets tileset
var cartoDB_Map = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
	{
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		subdomains: 'abcd',
	})

//satellite tileset
var HERE_hybridDay = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/hybrid.day/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
	attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
	subdomains: '1234',
	mapID: 'newest',
	app_id: '4hRsdRmGBf2l2Hn2o1ET',
	app_code: 'Am10DtpE3d21BS94dezWSg',
	base: 'aerial',
	maxZoom: 16,
	minZoom: 12,
	type: 'maptile',
	language: 'eng',
	format: 'png8',
	size: '256'
});




//////////////////////
////// Doc Setup /////
//////////////////////


//disable drag when on info panel
$('#panel').on('mousedown dblclick', function(e)
{
	L.DomEvent.stopPropagation(e);
});

// load first flood data when page loads
$('#document').ready(function()
{
	getData();
	createFloodLevelSlider();
	init();


});

/////////////////////////////
/////// Sattelite Slider ////
/////////////////////////////

function init(){
	map.addLayer(cartoDB_Map);
	map.addLayer(HERE_hybridDay);
	HERE_hybridDay.setOpacity(0);
}
function restOpacitySlider (){
	$('#OPslide').val(0)
};

function updateOpacity(value) {
    HERE_hybridDay.setOpacity(value);
};

//////////////////////
/////// Buttons //////
//////////////////////


//remove all layers from the map when reset is clicked
$('#reset').on('click', resetFloods);
$('#reset').on('click',restOpacitySlider);
//readd the number of flood levels based on current index
function resetFloods()
{
	currentLayer = 'lakes';

	removeExtraLayers();

	//add the first layer style
	floodDataArray[0].addTo(map);
	floodDataArray[0].eachLayer(function(layer)
	{
		layer.setStyle({fillColor: '#128AB3', stroke: false, fillOpacity: .5});
	});

	//add the style for the additional flood levels
	for(var i = 1; i <= Number(currentIndex); i++)
	{
		floodDataArray[i].addTo(map);
		floodDataArray[i].eachLayer(function(layer)
		{
			layer.setStyle({fillColor: '#128AB3', stroke: false, fillOpacity: .2});
		});

	};

};


$('#satellite').on('click', function()
{
		addSatellite();
});

$('#breaks').on('click', function()
{
		// if(hasBreakPoints)
		// {
		// 	console.log('to')
		// 	breakPoints.eachLayer(function(layer) 
		// 	{
		// 		map.removeLayer(layer);
		// 		hasBreakPoints = false;
		// 	});
			
		// }

		// hasBreakPoints = true;
		updateDikeBreaks();
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
	$('.range-slider').val(index);
	currentIndex = index;


	//Update Flood Layers
	updateFloodLayers();

	});

	$('.range-slider').on('input', function()
	{
		prevIndex = currentIndex;
		currentIndex = $(this).val();

		// call update layers
		updateFloodLayers();

	});
};





//////////////////////
/////Flood Levels/////
//////////////////////


//WTF IS GOING ON WITH THIS????
//all layers load in the right order, except levels 6 & 7 are switched
//geojsons are named correctly 
//I think its an issue with pushing to the floodlevel array in the callback, 
//but I can't figure it out HELPPPPPPPPPPP
function updateFloodLayers()
{

	var change = currentIndex - prevIndex;
	// console.log('curr' + currentIndex);
	// console.log('prev' + prevIndex)
	// console.log('change' + change)

	//slider has moved forward
	//add number of layers that the slider has moved
	if(change > 0)
	{
		for(var i = Number(prevIndex) + 1; i <= Number(currentIndex); i++)
		{
			// console.log('adding' + fileArray[i])
			floodDataArray[i].addTo(map);

		};

	}

	//slider has moved backwards
	//remove number of layers that slider has moved
	else if(change < 0)
	{
		for(var i = Number(currentIndex) + 1; i <= Number(prevIndex); i++)
		{
			// console.log('removing' + fileArray[i])
			map.removeLayer(floodDataArray[i]);
		};
	};

	//check whether map has breakpoints
	//update if they're found
	if(map.hasLayer(breakPoints))
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



//////////////////////
///////Overlays///////
//////////////////////

function addSatellite(overlay)
{
	if(map.hasLayer(cartoDB_Map))
	{
		map.removeLayer(cartoDB_Map);
		HERE_hybridDay.addTo(map);
	}
	else
	{
		map.removeLayer(HERE_hybridDay);
		cartoDB_Map.addTo(map);
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


//remove all layers except the basemap
function removeExtraLayers()
{
	map.eachLayer(function(layer)
	{
		if(layer._leaflet_id != 22 && layer._leaflet_id != 14496)
		{
			map.removeLayer(layer);
		};
	});
};


function loadSOVI() 
{
	
	removeExtraLayers();

	floodDataArray[currentIndex].addTo(map);

	floodDataArray[currentIndex].eachLayer(function(layer)
	{
		
		var soviIndex = layer.feature.properties.SOVI_3CL;

		//no data
		if(!soviIndex)
		{
			layer.setStyle({fillColor: 'gray', fillOpacity: .5, stroke: false});	
		}
		
		//sovi classes
		switch(soviIndex)
		{
			case 'Low': layer.setStyle({fillColor: '#fee6ce', fillOpacity: .5, stroke: false}); break;
			case 'Medium': layer.setStyle({fillColor: '#fdae6b', fillOpacity: .5, stroke: false}); break;
			case 'High': layer.setStyle({fillColor: '#e6550d', fillOpacity: .5, stroke: false}); break;
		};

	});
};

//load the business at risk data
function loadBLS() 
{

	removeExtraLayers()

	floodDataArray[currentIndex].addTo(map);

	floodDataArray[currentIndex].eachLayer(function(layer)
	{
		
		var blsIndex = layer.feature.properties.EMPLOYMENT;

		//nodata
		if(!blsIndex)
		{
			layer.setStyle({fillColor: 'gray', fillOpacity: .5, stroke: false});	
		}
		
		//bls classes
		switch(blsIndex)
		{
			case '<100': layer.setStyle({fillColor: '#f2f0f7', fillOpacity: .7, stroke: false}); break;
			case '100-499': layer.setStyle({fillColor: '#cbc9e2', fillOpacity: .7, stroke: false}); break;
			case '500-999': layer.setStyle({fillColor: '#9e9ac8', fillOpacity: .7, stroke: false}); break;
			case '1,000 or Greater': layer.setStyle({fillColor: '#6a51a3', fillOpacity: .7, stroke: false}); break;
			case 'Suppressed': layer.setStyle({fillColor: 'gray', fillOpacity: .5, stroke: false}); break;
		};

	});
};


//load the number of people affected
function loadAffectedPopulation() 
{

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
		// 	layer.setStyle({fillColor: 'gray', fillOpacity: .5, stroke: false});	
		// }
		
		//affected pop classes
		if(popIndex < 500)
		{ 
			layer.setStyle({fillColor: '#edf8e9', fillOpacity: .8, stroke: false}); 
		}
		else if(popIndex < 1000)
		{
			layer.setStyle({fillColor: '#bae4b3', fillOpacity: .8, stroke: false}); 
		}
		else if(popIndex < 1500)
		{
			layer.setStyle({fillColor: '#74c476', fillOpacity: .8, stroke: false});
		}
		else if(popIndex < 2000)
		{
			layer.setStyle({fillColor: '#31a354', fillOpacity: .8, stroke: false});
		}
		else if(popIndex < 2500)
		{
			layer.setStyle({fillColor: '#006d2c', fillOpacity: .8, stroke: false});
		}
		else
		{
			layer.setStyle({fillColor: 'black', fillOpacity: .5, stroke: false});
		}

	});
};

//load property lost
function loadPropertyLoss() 
{

	//remove all the layers
	removeExtraLayers()

	//add back only the current layer
	floodDataArray[currentIndex].addTo(map);

	//stylize each layer
	floodDataArray[currentIndex].eachLayer(function(layer)
	{
		console.log(layer.feature.properties.MEDIAN_INC)
		
		var propIndex = layer.feature.properties.MAX_PROPER;

		//nodata
		// if(!propIndex)
		// {
		// 	layer.setStyle({fillColor: 'gray', fillOpacity: .5, stroke: false});	
		// }
		
		//affected pop classes
		if(propIndex < 2000000)
		{ 
			layer.setStyle({fillColor: '#feedde', fillOpacity: .8, stroke: false}); 
		}
		else if(propIndex < 4000000)
		{
			layer.setStyle({fillColor: '#fdd0a2', fillOpacity: .8, stroke: false}); 
		}
		else if(propIndex < 6000000)
		{
			layer.setStyle({fillColor: '#fdae6b', fillOpacity: .8, stroke: false});
		}
		else if(propIndex < 8000000)
		{
			layer.setStyle({fillColor: '#fd8d3c', fillOpacity: .8, stroke: false});
		}
		else if(propIndex < 10000000)
		{
			layer.setStyle({fillColor: '#e6550d', fillOpacity: .8, stroke: false});
		}
		else
		{
			layer.setStyle({fillColor: '#a63603', fillOpacity: .8, stroke: false});
		}

	});
};

//load median income
function loadMedianIncome() 
{

	//remove all the layers
	removeExtraLayers()

	//add back only the current layer
	floodDataArray[currentIndex].addTo(map);

	//stylize each layer
	floodDataArray[currentIndex].eachLayer(function(layer)
	{
		// console.log(layer.feature.properties.MEDIAN_INC)
		
		var incomeIndex = layer.feature.properties.MEDIAN_INC;

		//income of 0
		if(incomeIndex == 0)
		{
			layer.setStyle({fillColor: 'gray', fillOpacity: .5, stroke: false});	
		};
		
		//affected pop classes
		if(incomeIndex < 15000)
		{ 
			layer.setStyle({fillColor: '#edf8fb', fillOpacity: .5, stroke: false}); 
		}
		else if(incomeIndex < 30000)
		{
			layer.setStyle({fillColor: '#bfd3e6', fillOpacity: .5, stroke: false}); 
		}
		else if(incomeIndex< 45000)
		{
			layer.setStyle({fillColor: '#b3cde3', fillOpacity: .5, stroke: false});
		}
		else if(incomeIndex < 60000)
		{
			layer.setStyle({fillColor: '#8c96c6', fillOpacity: .5, stroke: false});
		}
		else if(incomeIndex < 75000)
		{
			layer.setStyle({fillColor: '#8856a7', fillOpacity: .5, stroke: false});
		}
		else
		{
			layer.setStyle({fillColor: '#810f7c', fillOpacity: .5, stroke: false});
		}

	});
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

	//flood levels 2-7
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
			}
		}).then(function() {
			floodDataArray.push(layer);
		});;
	};


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
					return {color: '#755144'};
				}
			});
		}
	});


	//flood level 8 /////////weird error
	// $.ajax(fileArray[6],
	// {
	// 	dataType: 'json',
	// 	success: function(response)
	// 	{
	// 		l1 = L.geoJson(response,
	// 		{
	// 			style: function (feature)
	// 			{
	// 				return {fillColor: '#128AB3', stroke: false, fillOpacity: .2};
	// 			}
	// 		});
	// 	}
	// }).then(function() {
	// 	floodDataArray.push(layer);
	// });

};
