// Define the dimensions of the map
var width = 960,
    height = 600;

// Create an SVG element in your document to hold the map
var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection for the map
var projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

// Define a path generator using the projection
var path = d3.geoPath()
    .projection(projection);

// Create a tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Define a color scale
var color = d3.scaleQuantize()
    .domain([0, 8]) // Assuming your CSV values range from 0 to 8
    .range(d3.schemeOranges[9]); // This creates 9 shades of blue, from light to dark


// Create a legend
var legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(" + (width - 100) + "," + 20 + ")");
// This places the legend on the right side of the map, 100 pixels from the right edge and 20 pixels from the top.

var legendItemSize = 20; // Height of each legend item
var legendSpacing = 2; // Spacing between legend items
color.range().forEach(function(d, i) {
  legend.append("rect")
    .attr("x", 0)
    .attr("y", i * (legendItemSize + legendSpacing))
    .attr("width", legendItemSize)
    .attr("height", legendItemSize)
    .style("fill", d);
});

var legendDomain = color.domain();
legend.selectAll('text')
  .data(legendDomain)
  .enter().append('text')
  .attr("x", legendItemSize + legendSpacing)
  .attr("y", function(d, i) { return i * (legendItemSize + legendSpacing) + (legendItemSize / 2); })
  .text(function(d) { return d; })
  .style("alignment-baseline", "middle");

// Move the number 8 physically below the bottom, darkest orange box
legend.selectAll('text')
  .filter(function(d) { return d === 8; })
  .attr("x", legendItemSize + legendSpacing)
  .attr("y", (color.range().length - 1) * (legendItemSize + legendSpacing) + legendItemSize - 8);


// Load the CSV data
d3.csv("states-values.csv").then(function(data) {
    // Convert data to a map for easy lookup
    var dataMap = new Map(data.map(function(row) {
        return [row.state, +row.value];
    }));

    console.log('CSV Data:', data); // Log the loaded CSV data
    console.log('Data Map:', dataMap); // Log the data map

    // Load the GeoJSON data
    d3.json("us-states.json").then(function(us) {
        console.log('GeoJSON Data:', us); // Log the loaded GeoJSON data

        // Draw the states
        svg.selectAll(".state")
            .data(us.features) // Use the features from the GeoJSON data
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path)
            .style("fill", function(d) {
                // Check if d and d.properties exist before accessing name
                if (d && d.properties && typeof d.properties.name !== 'undefined') {
                    var value = dataMap.get(d.properties.name);
                    if (typeof value === 'undefined') {
                        console.error('No matching state found for:', d.properties.name);
                        return "#ccc"; // Return a default color if no value is found
                    }
                    return color(value); // Calculate a color based on the value
                } else {
                    // Log the issue if d.properties is undefined
                    console.error('d.properties is undefined, feature:', d);
                    return "#ccc"; // Use a default color if properties are missing
                }
            })
            .style("stroke", "#000000") // Set the border color of each state to black
            .style("stroke-width", "1") // Set the stroke width
            .on("mouseover", function(event) {
    // Safely access the bound data from the current target
    var boundData = d3.select(this).datum();

    // Log the bound data
    console.log('Bound data on mouseover target:', boundData);

    if (!boundData || !boundData.properties) {
        console.error('Error: bound data is missing or does not contain properties on mouseover.', this);
        return; // Exit the function if bound data is missing or does not contain properties
    }

    // Extracting the state name and value
    var stateName = boundData.properties.name;
    var stateValue = dataMap.get(stateName);

    // Get the position of the map container
    var mapContainer = document.querySelector('#map'); // Replace with your map container ID or class
    var mapRect = mapContainer.getBoundingClientRect();

    // Show the tooltip with the state name and its value at the left corner of the map
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(stateName + "<br/>Value: " + stateValue) // Modified to show state name and value
        .style("left", mapRect.left + "px") // Position at the left edge of the map
        .style("top", mapRect.top + "px"); // Position at the top edge of the map
})
.on("mouseout", function() {
    // Hide the tooltip when the mouse leaves the element
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
});


    }).catch(function(error) {
        console.error('Error loading the GeoJSON file:', error);
    });
}).catch(function(error) {
    console.error('Error loading the CSV file:', error);
});