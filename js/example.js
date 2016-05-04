//////////////////////
// global variables //
//////////////////////

	var PAGE = '';

	var ABREVIATION = '';

	var RESETSLIDER = 0;

	var ATTRIBUTES;

	var KEYS;

	var SCALE;

	var INDUSTRY;

	var CURRENTYEAR;

	var YEAR1 = 'year1';

	var YEAR2;


	var BEGIN = 0;
	var END = 0;

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

	// L.control.zoom
	// ({
	// 	position:'topright'
	// })
	// .addTo(map);







//////////////////////////////////////////
// reset layers when dataset is changed //
//////////////////////////////////////////

	// remove all features with ids not equal to the basemap
	function removeLayers()
	{
		map.eachLayer(function(layer)
		{
			if(layer._leaflet_id != 22)
			{
				map.removeLayer(layer);
			}
		});

		// reset the slider value
		$('.range-slider').val(RESETSLIDER);

		getData(map);
	}


	// clear the inputs for dropdowns
	function resetBegin()
	{
		BEGIN = 0;
		END = 0;

		$('#yearCalculator input').each(function()
		{
			$(this).val('');
		});
	}

	// destroy the previous legend
	function destroyLegend()
	{
		$('.legend-control-container').remove();
	}

	// set the both year and industry data
	function setIndustryName()
	{
		$('.industryName').html(INDUSTRY);

		$('#currentYear').html(2008);
	}


	// function to call reset functions
	function resetLayers()
	{
		resetBegin();

		setIndustryName();

		destroyLegend();

		removeLayers();
	}








////////////////////////
// select an industry //
////////////////////////
// get the value for the begining year
$('#Industry li a').on('click', function()
{
	$('#chosenIndustry').val($(this).text());
});


// get the value for the begining year
$('#chooseIndustry').on('click', function()
{
	$('#chosenInudsty').val($(this).text());
});






////////////////////////////////////////////
// load a dataset based on the id clicked //
////////////////////////////////////////////

	// load agricultural data when page loads
	$('#document').ready(function() 
	{
		PAGE 		= 'data/agriculture.geojson';
		ABREVIATION = 'agr';
		SCALE = 80;
		INDUSTRY = 'Agriculture';
		CURRENTYEAR = 2008;

		resetLayers();

		createSequenceControls(ATTRIBUTES);
	});

	// load agricultural data
	$('#agriculture').click(function() 
	{
		PAGE 		= 'data/agriculture.geojson';
		ABREVIATION = 'agr';
		SCALE = 80;
		INDUSTRY = 'Agriculture';

		resetLayers();
	});

	// load arts data
	$('#arts').click(function()
	{
		PAGE 		= 'data/arts.geojson';
		ABREVIATION = 'arts';
		SCALE = 50;
		INDUSTRY ="Arts";

		resetLayers();
	});

	// load construction data
	$('#construction').click(function()
	{
		PAGE 		= 'data/construction.geojson';
		ABREVIATION = 'con';
		SCALE = 30;
		INDUSTRY ="Construction";

		resetLayers();
	});

	// load education data
	$('#education').click(function()
	{
		PAGE 		= 'data/education.geojson';
		ABREVIATION = 'edu';
		SCALE = 25;
		INDUSTRY = "Education";

		resetLayers();
	});

	// load finance data
	$('#finance').click(function()
	{
		PAGE = 'data/finance.geojson';
		ABREVIATION = 'fin';
		SCALE = 30;
		INDUSTRY = "Finance";

		resetLayers();
	});

	// load information data
	$('#information').click(function()
	{
		PAGE = 'data/information.geojson';
		ABREVIATION = 'info';
		SCALE = 80;
		INDUSTRY = "Information Technology";

		resetLayers();
	});

	// load manufacturing data
	$('#manufacturing').click(function()
	{
		PAGE = 'data/manufacturing.geojson';
		ABREVIATION = 'man';
		SCALE = 30;
		INDUSTRY = "Manufacturing";

		resetLayers();
	});


	// load professional data
	$('#professional').click(function()
	{
		PAGE = 'data/professional.geojson';
		ABREVIATION = 'pro';
		SCALE = 30;
		INDUSTRY = 'Professional';

		resetLayers();
	});

	// load public administration data
	$('#public').click(function()
	{
		PAGE = 'data/public.geojson';
		ABREVIATION = 'pub';
		INDUSTRY = 'Public Administration';
		SCALE = 50;
		
	
		resetLayers();
	});

	// load retail data
	$('#retail').click(function()
	{
		PAGE = 'data/retail.geojson';
		ABREVIATION = 'ret';
		SCALE = 30;
		INDUSTRY = 'Retail Trade';

		resetLayers();
	});

	// load transportation data
	$('#transportation').click(function()
	{
		PAGE = 'data/transportation.geojson';
		ABREVIATION = 'tran';
		SCALE = 60;
		INDUSTRY = "Transportation";

		resetLayers();
	});

	// load wholesale retail data
	$('#wholesale').click(function() 
	{
		PAGE = 'data/wholesale.geojson';
		ABREVIATION = 'whole';
		SCALE = 90;
		INDUSTRY = "Wholesale Trade";

		resetLayers();
	});

	// load the other category
	$('#other').click(function()
	{
		PAGE = 'data/other.geojson';
		ABREVIATION = 'other';
		SCALE = 70;
		INDUSTRY = "Other Industries";

		resetLayers();
	});







////////////////////////////
// get data from a datset //
////////////////////////////

	function getData(map)
	{
		// get the data from the geojson file
		$.ajax(PAGE,
		{
			dataType: "json",
			success: function(response)
			{
				// attributes is an array of an individual industry by year e.g. ['con2008', 'con2009', ....]
				var attributes = processData(response);

				// set the global attributes
				ATTRIBUTES = attributes;
				currentAttribute = attributes[0];

				// call function to create proportional symbols
				createPropSymbols(response, map, attributes);

				createLegend(map, currentAttribute);
			}
		});
	};








////////////////////////////////////////////////////////
// create an array of attributes for a given industry //
// to be used in point to layer                       //
////////////////////////////////////////////////////////
	function processData(data)
	{
		// attributes is an array of an individual industry by year e.g. ['con2008', 'con2009', ....]
		var attributes = [];

		// would list all properties associated with the first attribute 
		var properties = data.features[0].properties;
		//console.log(properties);

		//push each attribute name into attributes array
		for (var attribute in properties)
		{
			if(attribute.indexOf(ABREVIATION) > -1)
			{
				attributes.push(attribute);
				//console.log(attribute);
			}
		}
		return attributes;
	}







////////////////////////////////////////////////////////
// turn attributes and values into a layer of markers //
////////////////////////////////////////////////////////

	// create a geojson layer
	function createPropSymbols(data,map,attributes)
	{
		L.geoJson(data,
		{
			pointToLayer: function(feature,latlng)
			{
				return pointToLayer(feature,latlng,attributes);
			}
		})
		.addTo(map);
	}

	function buildPopup()
	{
		// build popup content string
        if(YEAR1 == 'year1')
        {
            var popupContent = "<p><b>Metro:</b> " + feature.properties.city_name + ' Metro' + "</p><p><b>Year:</b> " + 
            		CURRENTYEAR + "</p><p><b>Workfore Percentage: " + "</b> " + attributeValue + "%</p>";	
        }
        else
        {
			var popupContent = "<p><b>Region:</b> " + feature.properties.city_name + ' Metro Area' + 
					"<br /><b>Years:</b> " + YEAR1 + ' to ' + YEAR2 + "<br /><b>" + 'Percent Change: ' + 
						"</b> " + attributeValue + '%' + "</p>"; 
			console.log(YEAR1);          	
        }		
	}


	function pointToLayer(feature, latlng, attributes)
	{

		// list the attribute at index 0 e.g. con2008
		var attribute = attributes[0];


		//console.log(typeof attribute);
		var attributeValue;

		// create markers with cool options
		var geojsonMarkers = 
		{
			radius: 8,
			// fillColor: "#c3dbfe",
			// color: "#6fa9fe",
			weight: 1,
			opacity: 1,
			fillOpacity: .5
		};

		if(BEGIN == 0)
		{
			attributeValue = Number(feature.properties[attribute]);
			var KEYS = Object.keys(feature.properties);
			geojsonMarkers.fillColor = "#046fb8",geojsonMarkers.color = "#0035186";
		}
		else
		{
			var attributeValue1 = Number(feature.properties[BEGIN]);
			var attributeValue2 = Number(feature.properties[END]);
			var difference = attributeValue2 - attributeValue1;
			attributeValue = Math.abs(Number(difference.toFixed(1)));
			if (difference > 0)
			{
				geojsonMarkers.fillColor = "#046fb8",geojsonMarkers.color = "#0035186";
			}
			else
			{
				geojsonMarkers.fillColor = "#5a0c29",geojsonMarkers.color = "#781036";
			}
		}
		// determine radius for markers based on attribute value
		geojsonMarkers.radius = calculatePropRadius(attributeValue);

		// create circle markers
		var marker = L.circleMarker(latlng,geojsonMarkers);

		// build popup content string
        if(YEAR1 == 'year1')
        {
            var popupContent = "<p><b>Metro:</b> " + feature.properties.city_name + ' Metro' + "<br /><b>Year:</b> " + 
            		CURRENTYEAR + "<br /><b>Workfore Percentage: " + "</b> " + attributeValue + "%</p>";	
        }
        else
        {
			var popupContent = "<p><b>Region:</b> " + feature.properties.city_name + ' Metro Area' + 
					"<br /><b>Years:</b> " + YEAR1 + ' to ' + YEAR2 + "<br /><b>" + 'Percent Change: ' + 
						"</b> " + attributeValue + '%' + "</p>"; 
			console.log(YEAR1);          	
        }	

		// bind popup to the circle marker
		marker.bindPopup(popupContent,
		{
			offset: new L.Point(0, -geojsonMarkers.radius),
			closeButton: false		
		});

		// listeners to open popup on hover
	    marker.on(
	    {
	        mouseover: function()
	        {
	            this.openPopup();
	        },
	        mouseout: function()
	        {
	            this.closePopup();
	        }
	    });
		return marker;
	}

	// calculate radius of the proportional symbol
	function calculatePropRadius(attributeValue)
	{
		// set scale factor
		var scaleFactor = SCALE;

		// set area based on the attribute value and the scale factor
		var area = attributeValue * scaleFactor;

		// calculate radius using area
		var radius = Math.sqrt(area/Math.PI);

		return radius;
	}








//////////////////////////////
// create sequence controls //
//////////////////////////////



	// create the sequencing controls
	function createSequenceControls(attributes)
	{
			// set slider attributes
		$('.range-slider').attr(
		{
			max: 6,
			min: 0,
			value: 0,
			step: 1
		});

	    // array of our years
	    var yearsArray =[2008,2009,2010,2011,2012,2013,2014];

		$('.skip').click(function()
		{	
			//reset year
			YEAR1 = 'year1';

		    // get the old index value
		    var index = $('.range-slider').val();

		    // increment or decrement depending on button clicked
		    if ($(this).attr('id') == 'forward')
		    {
		        index++;

		        // go back to first attribute after last attribute
		        index = index > 6 ? 0 : index;
		    } 
		    else if ($(this).attr('id') == 'reverse')
		    {
		        index--;

		        // go back to last attribute after first attribute
		        index = index < 0 ? 6 : index;
		    };

		    var position = Number(index);
		    CURRENTYEAR = yearsArray[position];

		    // update slider
		    $('.range-slider').val(index);

		    // update the year
		    $('#currentYear').html(CURRENTYEAR);

		    // call updata prop symbols
		   	updatePropSymbols(map, ATTRIBUTES[index]);
		});

		$('.range-slider').on('input', function()
		{
			// reset year
			YEAR1 = 'year1';

			// get the value of the index based on position of range slider
		    var index = $(this).val();

		    var position = Number(index);
		    CURRENTYEAR = yearsArray[position];

		    // update the year
		    $('#currentYear').html(CURRENTYEAR);

		    // call update symbols
		    updatePropSymbols(map, ATTRIBUTES[index]);
		});		
	}







//////////////////////////////////////////////////////
// update proportional symbols when slider is moved //
//////////////////////////////////////////////////////

	function updatePropSymbols(map, attribute)
	{
		

	    map.eachLayer(function(layer)

	    {
	        if (layer.feature && layer.feature.properties[attribute])
	        {
	        	// reset begin and inputs
	        	resetBegin();

	            //access feature properties
	            var props = layer.feature.properties;

	            //update each feature's radius based on new attribute values
	            var radius = calculatePropRadius(props[attribute]);
	            layer.setRadius(radius);

	            // set the color back to single
	            layer.setStyle({fillColor:"#046fb8",color: "#0035186"});

				// build popup content string
		        if(YEAR1 == 'year1')
		        {
		            var popupContent = "<p><b>Metro:</b> " + props.city_name + ' Metro' + "<br /><b>Year:</b> " + 
		            		CURRENTYEAR + "<br /><b>Workfore Percentage: " + "</b> " + props[attribute] + "%</p>";	
				}
		        else
		        {
					var popupContent = "<p><b>Region:</b> " + feature.properties.city_name + ' Metro Area' + 
							"<br /><b>Years:</b> " + YEAR1 + ' to ' + YEAR2 + "<br /><b>" + 'Percent Change: ' + 
								"</b> " + attributeValue + '%' + "</p>"; 
					console.log(YEAR1);          	
		        }	

	            //replace the layer popup
	            layer.bindPopup(popupContent, 
	            {
	                offset: new L.Point(0,-radius)
	            });
	        };
	    });
	};






////////////////////////////////////////////////////////
// get the indexed values of the begin and end inputs //
////////////////////////////////////////////////////////
	
	// get the value for the begining year
	$('#begin li').on('click', function()
	{
		$('#yearOne').val($(this).text());
		YEAR1 = $(this).text();
	});

	// get the value for the ending year
	$('#end li').on('click', function()
	{
		$('#yearTwo').val($(this).text());
		YEAR2 = $(this).text();
	});



	// get the values for the two years on submit
	$('#years').on('click', function()
	{
		$('#currentYear').html(YEAR1 + ' to ' + YEAR2);
		var yearOne = Number($('#yearOne').val());
		var yearTwo = Number($('#yearTwo').val());
		var yearIndex = [2008,2009,2010,2011,2012,2013,2014];
		var begin =  yearIndex.indexOf(yearOne);
		var end = yearIndex.indexOf(yearTwo);

		// convert begin and end to a number
		begin = Number(begin);
		end = Number(end);

		// get the indexed values of begin and end
		BEGIN = ATTRIBUTES[begin];
		END = ATTRIBUTES[end];

		destroyLegend();

		// call removelayers and output the map
		removeLayers();
	})






/////////////////////////////
// create a fucking legend //
/////////////////////////////

	// calculate max, mean, and min values for an attribute
	function getCircleValues(map, attribute)
	{
	    // start with min at highest possible and max at lowest possible number
	    var min = Infinity,
	        max = -Infinity;

	    map.eachLayer(function(layer)
	    {
	        // get the attribute value
	        if (layer.feature)
	        {
	            var attributeValue = Number(layer.feature.properties[attribute]);

	            //test for min
	            if (attributeValue < min)
	            {
	                min = attributeValue;
	            };

	            //test for max
	            if (attributeValue > max)
	            {
	                max = attributeValue;
	            };
	        };
	    });

	    // set mean
	    var mean = (max + min) / 2;

	    min = min;
	    max = max;
	    mean = mean;

	    // return values as an object
	    return circ =
	    {
	        mean: mean,
	        max: max,
	        min: min
	    };
	};


	// update legend with new attributes
	function updateLegend(map, attribute)
	{
	    // replace legend content
	    $('#temporal-legend').html('% ' + INDUSTRY);

    	// get max, mean, and min values as an object
    	var circleValues = getCircleValues(map, attribute);

	    for (var key in circleValues)
	    {
	        // get radius
	        var radius = calculatePropRadius(circleValues[key]);

	        // assign the cy and r attributes
	        $('#'+key).attr(
	        {
	            cy: 60 - radius,
	            r: radius
	        });

        	// add legend text
        	$('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + "%");
	    };
	};


	// create the fucking legend
	function createLegend(map, attributes)
	{
	    var LegendControl = L.Control.extend(
	    {
	        options: 
	        {
	            position: 'bottomleft'
	        },

	        onAdd: function (map) 
	        {
	            // create the control container with class name
	            var container = L.DomUtil.create('div', 'legend-control-container');

	            // create attribute legend svg string
	            var svg = '<svg id="attribute-legend" width="300px" height="70px">';

	            // an array of circle names
	            var circles = {
	            	max: 30,
	            	mean: 45,
	            	min: 60
	            };


	            // loop to add circles and text to the svg string
	            for (var circle in circles)
	            {
	            	svg += '<circle class="legend-circle" id="' + circle + '" fill="#046fb8" fill-opacity=".8" stroke="#153078" cx="140" />';

	            	//text string
            		svg += '<text id="' + circle + '-text" x="165" y="' + circles[circle] + '"></text>';
	            }

	            // svg += '<rect class="legend-square" width="20px" height="20px" fill="#0035186" cx="185" cy="45"/>';

	            // close
	            svg += "</svg>";

	            // add a temporal legend div to container
	            $(container).append
	            (
	            	'<div id="legendText"><div id="temporal-legend"></div></div>'
	            )

	            // add attribute legend svg to container
	            $(container).append(svg);

	            return container;
	        }
	    });

	    map.addControl(new LegendControl());

	    updateLegend(map, attributes);
	};





		// some cool shit on accessing properties
		// for agriculture
		// var keys = Object.keys(feature.properties);
		// console.log(KEYS[6].substring(11,15));
		// console.log(KEYS[6].substring(0,11));
		// console.log(keys[7].substring(0,7));