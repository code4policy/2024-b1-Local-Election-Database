// Define the dimensions of the map
const width = 1300,
      height = 800;

// Create an SVG element in your document to hold the map
const svg = d3.select("#map_chi").append("svg")
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
const tooltipOffsetX = 10; // Adjust as needed for your layout
const tooltipOffsetY = 10; // Adjust as needed for your layout
const tooltip = d3.select(".tooltip2")
    .style("opacity", 0);

// Define a color scale for gender representation
const color = d3.scaleOrdinal()
    .domain(["Low Gender Representation", "Low Gender Representation not Detected"])
    .range(["red", "green"]); // Red for low, green for non-dection

// Define zoom behavior
const zoom = d3.zoom()
    .scaleExtent([1, 10])
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
        const data = await d3.csv("chi_square_results_with_female_representation_score_by_fips.csv").catch(error => {
            throw new Error(`Error loading CSV file: ${error.message}`);
        });
console.log('No data found for', data);
        // Convert data to a map for easy lookup
        const dataMap = new Map(data.map(row => {
            // Parse the Years field from a string to an array, handling potential single quotes
            let yearsParsed;
            try {
                yearsParsed = JSON.parse(row.Years.replace(/'/g, '"'));
            } catch (e) {
                console.error('Error parsing years:', row.Years);
                yearsParsed = []; // fallback to an empty array in case of error
            }
            return [row.fips, {
                FemaleCount: row.FemaleCount,
                MaleCount: row.MaleCount,
                Years: yearsParsed, // Now an array
                Representation: row.Representation
            }];
        }));

        console.log('No data found for', dataMap);

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
                try {
                    if (d && d.properties && 'FIPS' in d.properties) {
                        var countyFIPS = d.properties.FIPS;
                       // console.log('No data found for', dataMap);
                        var dataRow = dataMap.get(countyFIPS);
                        if (dataRow === undefined) {
                            console.log('No data found for', countyFIPS);
                            return "#ccc"; // Default color for missing data
                        }
                        return color(dataRow.Representation);
                    } else {
                        console.error('Invalid feature detected:', d);
                        return "#ccc"; // Default color for invalid features
                    }
                } catch (error) {
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
                    const countyFIPS = d.properties.FIPS;
                    const countyData = dataMap.get(countyFIPS);
                    if (!d.properties || !countyData) {
                        console.error('Missing properties for feature:', d);
                        tooltip.html(`County: ${d.properties.NAME}<br/>No Data Available`);
                    } else if (typeof d.properties.FIPS === 'undefined') {
                        console.error('Missing FIPS for feature:', d);
                        tooltip.html(`Feature ID ${d.id}<br/>No FIPS Available`);
                    } else {
                        const countyFIPS = d.properties.FIPS;
                        const value = dataMap.has(countyFIPS) ? dataMap.get(countyFIPS) : 'No data';
                        tooltip.html(
                            `County: ${d.properties.NAME}<br/>
                             Female Count: ${countyData.FemaleCount}<br/>
                             Male Count: ${countyData.MaleCount}<br/>
                             Years: ${countyData.Years.join(', ')}<br/>
                             Representation: ${countyData.Representation}`
                        )
                    }

                    // Position the tooltip in the top-left corner of the SVG (map)
                    // Adjust the offsets (10px in this example) as needed
                    tooltip.style("opacity", 0.9)
     
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
    .attr("transform", `translate(${width - 400}, 50)`);


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


    } catch (error) {
        // Handle any errors that occurred during the map drawing process
        console.error('Error occurred:', error.message);
    }
}

// Call the function to draw the map
drawMap();
