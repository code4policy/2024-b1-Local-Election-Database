// Define the dimensions of the map
const width = 1200,
      height = 1000;

// Create an SVG element in your document to hold the map
const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection for the map
const projection = d3.geoAlbersUsa()
    .scale(1500)
    .translate([width / 2, height / 2]);

// Define a path generator using the projection
const path = d3.geoPath()
    .projection(projection);

// Create a tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Define a color scale
const color = d3.scaleQuantize()
    .domain([0, 8]) // Assuming your CSV values range from 0 to 8
    .range(d3.schemeOranges[9]); // This creates 9 shades of orange

// Define zoom behavior
const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

// Zoom function that applies the transform to both counties and state borders
function zoomed() {
    const { transform } = d3.event;
    svg.selectAll('.county, .state-border') // Select both counties and state borders
       .attr('transform', transform);
}

// Apply the zoom behavior to the SVG
svg.call(zoom);

// Double-click event handler function
function doubleClicked(d) {
    // Calculate the x and y position to center the zoom on the double-clicked county
    const [x, y] = path.centroid(d);
    const zoomLevel = 4; // Set the desired zoom level
    svg.transition()
       .duration(750) // Set the duration of the transition
       .call(
           zoom.transform, 
           d3.zoomIdentity // Reset the zoom
               .translate(width / 2, height / 2) // Center the SVG
               .scale(zoomLevel) // Apply the zoom level
               .translate(-x, -y) // Translate to the centroid of the county
       );
}

// Attach the double-click zoom event to each county
svg.selectAll(".county")
   .on("dblclick", doubleClicked);

// Add a frame around the SVG container
svg.append("rect")
   .attr("x", 0)
   .attr("y", 0)
   .attr("width", width)
   .attr("height", height)
   .style("fill", "none") // No fill to make it transparent inside
   .style("stroke", "black") // Stroke color
   .style("stroke-width", "3px"); // Stroke width

// Function to load data and draw the map
async function drawMap() {
    try {
        // Load the CSV data
        const data = await d3.csv("counties_with_random_numbers.csv").catch(error => {
            throw new Error(`Error loading CSV file: ${error.message}`);
        });

        // Convert data to a map for easy lookup
        const dataMap = new Map(data.map(row => {
            if (!row.FIPS || row.Value === undefined) {
                throw new Error('CSV file is missing County or RandomNumber columns');
            }
            return [row.FIPS, +row.Value];
        }));

        // Load the GeoJSON data
        const us = await d3.json("us-counties.json").catch(error => {
            throw new Error(`Error loading GeoJSON file: ${error.message}`);
        });

        // Draw the counties
        svg.selectAll(".county")
            .data(us.features) // Use the features from the GeoJSON data
            .enter().append("path")
            .attr("class", "county")
            .attr("d", path)
            .style("fill", function(d) {
                // Use a try-catch block to handle exceptions
                try {
                    // Ensure that d, d.properties, and d.properties.FIPS exist
                    if (d && d.properties && 'FIPS' in d.properties) {
                        var countyFIPS = d.properties.FIPS;
                        var value = dataMap.get(countyFIPS);
                        // If value is not found, use a default color and log it
                        if (value === undefined) {
                            console.log('No value found for', countyFIPS);
                            return "#ccc";
                        }
                        return color(value);
                    } else {
                        // If properties are not correctly defined, use a default color and log it
                        console.error('Invalid feature detected:', d);
                        return "#ccc"; // Default color for invalid features
                    }
                } catch (error) {
                    // If any other error occurs, log the error and the problematic data feature
                    console.error('Error processing feature:', d, error);
                    return "#ccc"; // Use a default color for features causing errors
                }
            })
            .style("stroke", "#000000") // Set the border color of each county to black
            .style("stroke-width", "0.2") // Set the stroke width
            .on("mouseover", function(d, event) {
                // Function to update tooltip position and content
                const updateTooltip = (e) => {
                    const svgTop = svg.node().getBoundingClientRect().top;
                    const svgLeft = svg.node().getBoundingClientRect().left;

                    if (!d.properties) {
                        console.error('Missing properties for feature:', d);
                        tooltip.html(`Feature ID ${d.id}<br/>No Data Available`);
                    } else if (typeof d.properties.FIPS === 'undefined') {
                        console.error('Missing FIPS for feature:', d);
                        tooltip.html(`Feature ID ${d.id}<br/>No FIPS Available`);
                    } else {
                        const countyFIPS = d.properties.FIPS;
                        const value = dataMap.has(countyFIPS) ? dataMap.get(countyFIPS) : 'No data';
                        tooltip.html(`County: ${d.properties.NAME}<br/>Value: ${value}`);
                    }

                    // Position the tooltip in the top-left corner of the SVG (map)
                    // Adjust the offsets (10px in this example) as needed
                    tooltip.style("opacity", 0.9)
                           .style("left", (svgLeft + 10) + "px")
                           .style("top", (svgTop + 10) + "px");
                };

                // Update the tooltip immediately without waiting for mousemove
                updateTooltip(event);

                // Update the tooltip on mouse move within the county
                svg.on("mousemove", updateTooltip);
            })
            .on("mouseout", function() {
                // Remove the mousemove event listener when not hovering over a county
                svg.on("mousemove", null);

                tooltip.transition()
                       .duration(500)
                       .style("opacity", 0);
            });

// Load and draw state borders
d3.json("us-states.json").then(function(statesData) {
    svg.selectAll(".state-border")
        .data(statesData.features)
        .enter().append("path")
        .attr("class", "state-border")
        .attr("d", path) // Use the same path generator
        .style("fill", "none") // No fill for state borders
        .style("stroke", "black") // Style for state borders
        .style("stroke-width", "1"); // Bolder line for state borders
});

// Create a legend
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("id", "map-legend") // Unique ID for the legend
    .attr("transform", `translate(${width - 50}, 50)`);


const legendItemSize = 20; // Height of each legend item
const legendSpacing = 2; // Spacing between legend items

color.range().forEach((d, i) => {
    legend.append("rect")
        .attr("x", 0)
        .attr("y", i * (legendItemSize + legendSpacing))
        .attr("width", legendItemSize)
        .attr("height", legendItemSize)
        .style("fill", d)
        .style("stroke", "white") // Set the stroke color to white
        .style("stroke-width", "1px"); // Set the stroke width. Adjust as needed.
});

const legendDomain = color.domain();
legend.selectAll('text')
    .data(legendDomain)
    .enter().append('text')
    .attr("x", legendItemSize + legendSpacing)
    .attr("y", (d, i) => i * (legendItemSize + legendSpacing) + (legendItemSize / 2))
    .text(d => d)
    .style("alignment-baseline", "middle");

// Move the number 8 physically below the bottom, darkest orange box
legend.selectAll('text')
    .filter(d => d === 8)
    .attr("x", legendItemSize + legendSpacing)
    .attr("y", (color.range().length - 1) * (legendItemSize + legendSpacing) + legendItemSize - 8);

    } catch (error) {
        // Handle any errors that occurred during the map drawing process
        console.error('Error occurred:', error.message);
    }
}

// Call the function to draw the map
drawMap();

