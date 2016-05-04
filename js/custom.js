//////////////////////
// global variables //
//////////////////////

var fileArray = ['data/DummyJsons/v1.geojson',
				 'data/DummyJsons/v2.geojson',
				 'data/DummyJsons/v3.geojson',
				 'data/DummyJsons/v4.geojson',
				 'data/DummyJsons/v5.geojson',
				 'data/DummyJsons/v6.geojson',
				 'data/DummyJsons/v7.geojson'];

var dataArray = [];

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
	})
	.addTo(map);

//disable drag when on info panel
$('#panel').on('mousedown dblclick', function(e) 
{
	L.DomEvent.stopPropagation(e);
});

// load first flood data when page loads
$('#document').ready(function() 
{
	getData();
	window.setTimeout(createFloodLevelSlider(), 100000);
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

function updateFloodLayers()
{

	var change = currentIndex - prevIndex;
	console.log(change);
	if(change > 0)
	{
		for(var i = Number(prevIndex) + 1; i <= Number(currentIndex); i++)
		{
			console.log(dataArray[i]);
			dataArray[i].addTo(map);
			
		};

	}
	else if(change < 0)
	{
		for(var i = Number(currentIndex) + 1; i <= Number(prevIndex); i++)
		{
			map.removeLayer(dataArray[i]);
		};
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
					return {fillColor: 'blue', stroke: false, fillOpacity: .2};
				}
			}).addTo(map);
		}
	}).then(function() {
		dataArray.push(l1);
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
						return {fillColor: 'blue', stroke: false, fillOpacity: .2};
					}
				});
				dataArray.push(layer);
			}
		});
	};





	// $.ajax(v6, 
	// {
	// 	dataType: 'json',
	// 	success: function(response)
	// 	{
	// 		test2 = L.geoJson(response, 
	// 		{
	// 			style: function (feature) 
	// 			{
	// 				return {fillColor: 'blue', stroke: false, fillOpacity: .2};
	// 			}
	// 		});
	// 	}
	// });

};








