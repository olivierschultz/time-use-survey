/*
    Tutorial read for example :
    https://github.com/d3/d3/wiki/Gallery
    https://bl.ocks.org/mbostock/4063423
    JSON for Europe Map from : https://github.com/nstehr/NHL-Lockout-Map (I suppressed Russia from the geo data)
*/

// Define var for selected filter with default value
var selected_gender = "Total"
var selected_time = "2000"
var selected_daysweek = "All days of the week"
var selected_acl = "Personal care"
var selected_country = "France"

// ACL Color range in phase with Sunburst colors
var range_Personal_Care = ["#ffe6ce", "#dd6800"]
var range_Employment = ["#dccee9", "#8760b2"]
var range_Study = ["#ffcccc", "#b90064"]
var range_Household = ["#a6e2c0", "#009f00"]
var range_Leisure = ["#ffe5cc", "#ff7f00"]
var range_Travel = ["#ecd9c6", "#805c07"]

// Sub categories ACL
var personalCare_subACL = ['Sleep', 'Eating', 'Other and/or unspecified personal care'];
var employment_subACL = ["Main and second job and related travel", "Activities related to employment and unspecified employment"];
var study_subACL = ["School and university except homework", "Homework", "Free time study"]
var household_subACL = ["Food management except dish washing", "Dish washing", "Cleaning dwelling"]
var leisure_subACL = ["Organisational work", "Informal help to other households", "Participatory activities"]
var travel_subACL = ["Travel to/from work", "Travel related to study", "Travel related to shopping and services",
                     "Transporting a child", "Travel related to other household purposes", "Travel related to leisure, social and associative life", "Unspecified travel"]

// Dataset, and cache for fitered dataset
let dataset = [];
let filtered_dataset = [];
let range_color = range_Personal_Care;
let domain = [0, 2400]

// Map Width/Height
var mapSvgWidth = 850;
var mapSvgHeight = 850;

// Define the div for the tooltip
var divtooltip4Map = d3.select("body").append("div").attr("class", "tooltipmap");
var divtooltip4Sunburst = d3.select("body").append("div").attr("class", "tooltipmap");

// Load Data and Geo Json for Europe
d3.csv("../data/europe/time_use_formatted_data_map.csv").row(
        (d, i) => {
            return {
                geo: d["GEO"],
                time: d["TIME"],
                daysweek: d["DAYSWEEK"],
                gender: d["SEX"],
                acl: d["ACL00"],
                value: d["Value"], // Time hh:mm
                duration: parseValueToDuration(d["Value"]) // Duration in minutes
            };
        }
    )
    .get(
        (error, rows) => {
            console.log("Loaded " + rows.length + "rows");
            if (rows.length > 0) {
                console.log("First row: ", rows[0]);
                console.log("Last row: ", rows[rows.length - 1]);
                dataset = rows;

                d3.json('../data/europe/europe.json', function(countries) {
                    displayMap(countries, dataset);
                    updateSunBurst(selected_country);
                });
            }
        }
    );


// Function for rendering Map
function displayMap(europe, dataset) {

    // Keep the values corresponding to selected filters
    filtered_dataset = dataset.filter(row => row.gender == selected_gender && row.time == selected_time && row.daysweek == selected_daysweek && row.acl == selected_acl);
    // Compute min / max duration - needed for color scale and legend
    domain = computeMinMax(dataset.filter(row => row.acl == selected_acl));

    var projection = d3.geoMercator().scale(550).translate([300, 1050]);;
    var path = d3.geoPath().projection(projection)
    var svgmap = d3.select("#map").append("svg")
        .attr("width", mapSvgWidth)
        .attr("height", mapSvgHeight);

    // SVG MAP
    svgmap.append("g").attr("id", "europe")
        .selectAll("path")
        .data(europe.features)
        .enter().append("path")
        .attr("d", path)
        .attr("name", function(d) {
            return d.properties.CntryName;
        })
        .attr("stroke", "lightgray")
        .attr("fill", function(d) {
            return getfill4Country(d.properties.CntryName, domain, filtered_dataset);
        })
        .on("mouseover", handleMapMouseOver)
        .on("mouseout", handleMapMouseOut)
        .on("click", function(d, i) {
					  selected_country = d.properties.CntryName;
            updateSunBurst(d.properties.CntryName);
        });

    // AXIS SCALE AND LEGEND
    var linearGradient = svgmap.append("defs").append("linearGradient").attr("id", "linear-gradient");
    linearGradient.attr("x1", "0%").attr("y1", "100%").attr("x2", "0%").attr("y2", "0%");
    // Set the color for the start (0%) and for the end (100%)
    linearGradient.append("stop").attr("id", "linear-gradient-offset0").attr("offset", "0%").attr("stop-color", range_color[0]);
    linearGradient.append("stop").attr("id", "linear-gradient-offset100").attr("offset", "100%").attr("stop-color", range_color[1]);

    var legendsvg = svgmap.append("g").attr("id", "legendsvg");
    //Draw the rectangle and fill with gradient
    legendsvg.append("rect").attr("x", mapSvgWidth - 100).attr("y", mapSvgHeight / 8).attr("width", 10).attr("height", mapSvgHeight / 2).style("fill", "url(#linear-gradient)");
    //Define axis
    var yScale = d3.scaleLinear().range([mapSvgHeight / 4, -mapSvgHeight / 4]).domain(domain);
    var yAxis = d3.axisRight(yScale).ticks(10).tickFormat(function(d) {
        return Math.trunc(d / 60).toString().padStart(2, "0") + ":" + (d % 60).toString().padStart(2, "0");
    });
    legendsvg.append("g").attr("id", "axisLegendsvg")
        .attr("transform", "translate(765," + (3 * mapSvgHeight / 8) + ")")
        .call(yAxis);
    legendsvg.append("text")
        .attr("x", mapSvgWidth - 100).attr("y", -10 + mapSvgHeight / 8)
        .attr("class", "legendTitle")
        .style("text-anchor", "middle")
        .text("Time spent (hh:mm)");
}


// Add interactivity on mouse over the country
// Show Name + ACL value
function handleMapMouseOver(d) {
    var row = filtered_dataset.filter(row => row.geo == d.properties.CntryName);
    var acl_value = ((row.length > 0) ? row[0].value : 'Not available');
    divtooltip4Map.transition().duration(500).style("opacity", .9);
    divtooltip4Map.html(d.properties.CntryName + "<br/>" + acl_value)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
}

function handleMapMouseOut(d) {
    divtooltip4Map.transition().duration(500).style("opacity", 0);
}


// Update all viz (map +sunburst)
function updateViz(objButton, type) {
    updateMap(objButton, type);
    updateSunBurst(selected_country);
}

// Update Map on updated filters
function updateMap(objButton, type) {
    if (type == 'GENDER') selected_gender = objButton.value;
    if (type == 'TIME') selected_time = objButton.value;
    if (type == 'DAYS') selected_daysweek = objButton.value;
    if (type == 'ACL') {
        selected_acl = objButton.value;

        // Update axis scale and legend
        if (selected_acl == 'Personal care') range_color = range_Personal_Care;
        if (selected_acl == 'Employment, related activities and travel as part of/during main and second job') range_color = range_Employment;
        if (selected_acl == 'Study') range_color = range_Study;
        if (selected_acl == 'Household and family care') range_color = range_Household;
        if (selected_acl == 'Leisure, social and associative life') range_color = range_Leisure;
        if (selected_acl == 'Travel except travel related to jobs') range_color = range_Travel;

        domain = computeMinMax(dataset.filter(row => row.acl == selected_acl));
    }

    filtered_dataset = dataset.filter(row => row.gender == selected_gender && row.time == selected_time && row.daysweek == selected_daysweek && row.acl == selected_acl);
    var svgmap = d3.select('#europe').selectAll("path")
        .each(function(d, i) {
            d3.select(this).attr("fill", function(d) {
                return getfill4Country(d3.select(this).attr("name"), domain, filtered_dataset);
            });
        });

    // Redraw de l'échelle sur changement d'ACL
    if (type == 'ACL') {
        d3.select('#linear-gradient-offset0').attr("stop-color", range_color[0]);
        d3.select('#linear-gradient-offset100').attr("stop-color", range_color[1]);
        var yScale = d3.scaleLinear().range([mapSvgHeight / 4, -mapSvgHeight / 4]).domain(domain);
        var yAxis = d3.axisRight(yScale).ticks(10).tickFormat(function(d) {
            return Math.trunc(d / 60).toString().padStart(2, "0") + ":" + (d % 60).toString().padStart(2, "0");
        });
        d3.select('#axisLegendsvg')
            .attr("transform", "translate(765," + (3 * mapSvgHeight / 8) + ")")
            .call(yAxis);
    }
}

// Update sunburst on updated filters or onclick country map
function updateSunBurst(countryname) {

    // From dataset (CSV) Build JSON needed by sunburst
    data_json = buildHierarchy(countryname);

    var svgSunburstWidth = 600;
    var svgSunburstHeight = 600;
    var radius = 250;
    var color = d3.scaleOrdinal(d3.schemeDark2);

    d3.select("#sunburst").selectAll("svg").remove();

    var svg = d3.select("#sunburst").append('svg').attr("id", "svgsb")
        .attr('width', svgSunburstWidth)
        .attr('height', svgSunburstHeight)

    svg.append("text")
        .attr("x", svgSunburstWidth / 2).attr("y", 50)
        .attr("class", "countryName")
        .text(countryname);

    var g = svg.append('g')
        .attr('transform', 'translate(' + 350 + ',' + 350 + ')');

    var partition = d3.partition().size([2 * Math.PI, radius]);

    var root = d3.hierarchy(data_json)
        .sum(function(d) {
            return d.value
        });

    partition(root);

    var arc = d3.arc()
        .startAngle(function(d) {
            return d.x0
        })
        .endAngle(function(d) {
            return d.x1
        })
        .innerRadius(function(d) {
            return d.y0
        })
        .outerRadius(function(d) {
            return d.y1
        });

    g.selectAll('g')
        .data(root.descendants())
        .enter().append('g').attr("class", "node")
        .append('path')
        .attr("display", function(d) {
            return d.depth ? null : "none";
        })
        .attr("d", arc)
        .style('stroke', 'white')
        .style("fill", function(d) {
            return color((d.children ? d : d.parent).data.name);
        })
        .on("mouseover", handleSunburstMouseover)
        .on("mouseout", handleSunburstMouseout);


    g.selectAll(".node")
        .append("text")
        .attr("transform", function(d) {
            return "rotate(" + computeTextRotation(d) + ")";
        })
        //.attr("text-anchor", "end")
        .attr("x", function(d) {
            return radius / 3 * d.depth;
        })
        .attr("dx", "6")
        .attr("dy", ".35em")
        .text(function(d, i) {
            // Display text only if it could be screen readable
            return (d.depth == 2 && (d.x1 - d.x0) > 0.05)? d.data.name.split(" ")[0] : "";
        });

}


// Add interactivity on mouse over the sunburst
// Show Name + ACL value
function handleSunburstMouseover(d) {
    if(d.depth == 2) {
      divtooltip4Sunburst.transition().duration(500).style("opacity", .9);
      divtooltip4Sunburst.html(d.data.name + "<br/>" + formatDuration(d.data.value))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");
    }
}

function handleSunburstMouseout(d) {
    divtooltip4Sunburst.transition().duration(500).style("opacity", 0);
}

// Compute angle for text rotation in sunburst
function computeTextRotation(d) {
	var angle = (d.x0 + d.x1) * 180/ (2 * Math.PI) - 90;
  console.log(angle)
  if(angle > 180) {
    angle = angle +360;
  }
  //(ang > 90) ? 180 + ang : ang
	return angle;
}


// TOOLS FUNCTIONS

function getfill4Country(countryname, domain, rows) {
    var fill = d3.scaleLinear().domain(domain).range(range_color);
    for (var i in rows) {
        if (rows[i].geo == countryname) {
            if (rows[i].duration > 0) {
                return fill(rows[i].duration);
            }
        }
    }
    return "white";
}

function computeMinMax(rows) {
    var min = rows.reduce(function(prev, curr) {
        if (curr.duration == 0) return prev;
        if (prev.duration == 0) return curr;
        return prev.duration < curr.duration ? prev : curr;
    });
    var max = rows.reduce(function(prev, curr) {
        return prev.duration > curr.duration ? prev : curr;
    });
    return [min.duration, max.duration]
}

function parseValueToDuration(value) {
    var duration = 0;
    if (value != ":") {
        var splitValue = value.split(":");
        duration = parseInt(splitValue[0]) * 60 + parseInt(splitValue[1]);
    }
    return duration;
}

function formatDuration(duration) {
  return Math.trunc(duration / 60).toString().padStart(2, "0") + ":" + (duration % 60).toString().padStart(2, "0")
}

function buildHierarchy(countryname) {
    var root = {
        "name": "Time spent",
        "children": []
    };
    var node_Personal_Care = {
        "name": "Personal care",
        "children": []
    };
    var node_Employment = {
        "name": "Employment",
        "children": []
    };
    var node_Study = {
        "name": "Study",
        "children": []
    };
    var node_Household = {
        "name": "Household",
        "children": []
    };
    var node_Leisure = {
        "name": "Leisure",
        "children": []
    };
    var node_Travel = {
        "name": "Travel",
        "children": []
    };

    var children = root["children"];
    children.push(node_Personal_Care);
    children.push(node_Employment);
    children.push(node_Study);
    children.push(node_Household);
    children.push(node_Leisure);
    children.push(node_Travel);

    data = dataset.filter(row => row.gender == selected_gender && row.time == selected_time && row.daysweek == selected_daysweek && row.geo == countryname);

    for (i in data) {
        var nodeName = data[i].acl;
        var nodeValue = data[i].duration;

        // node_Personal_Care
        if (personalCare_subACL.indexOf(nodeName) != -1) {
            node_Personal_Care["children"].push({
                "name": nodeName,
                "value": nodeValue
            });
        }
        // node_Employment
        else if (employment_subACL.indexOf(nodeName) != -1) {
            node_Employment["children"].push({
                "name": nodeName,
                "value": nodeValue
            });
        }
        // node_Study
        else if (study_subACL.indexOf(nodeName) != -1) {
            node_Study["children"].push({
                "name": nodeName,
                "value": nodeValue
            });
        }
        // node_Household
        else if (household_subACL.indexOf(nodeName) != -1) {
            node_Household["children"].push({
                "name": nodeName,
                "value": nodeValue
            });
        }
        // node_Leisure
        else if (leisure_subACL.indexOf(nodeName) != -1) {
            node_Leisure["children"].push({
                "name": nodeName,
                "value": nodeValue
            });
        }
        // node_Travel
        else if (travel_subACL.indexOf(nodeName) != -1) {
            node_Travel["children"].push({
                "name": nodeName,
                "value": nodeValue
            });
        }
    }

    return root;
}
