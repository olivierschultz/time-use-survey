/* sources :
  http://bl.ocks.org/phoebebright/3061203
  https://bl.ocks.org/mbostock/2522624ada2c1f9e0fafb75cca09442b
  https://bl.ocks.org/js418/d3c64ba2efe864ccd8e16ddab4dde328
*/

var width = 1000,
    height = 600;

var format=d3.format(".1f");
var state;
var USmap;
var timeuse;
var dataByStates = d3.map();
var data;
var femaleData;
var maleData;
var layeredhistogram;
var svg = d3.select("#visualization").append("svg")
    .attr("width", width)
    .attr("height", height)

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width/2.1, height/2]);

var path = d3.geo.path()
    .projection(projection);

var colors = ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#e34a33","#b30000"];
var color = d3.scale.linear()
    .range(colors);

queue()
  .defer(d3.json, "../../../data/america/us-geo.json")
  .defer(d3.csv, "../../../data/america/map_america.csv", processData)
  .await(loaded);
queue()
  .defer(d3.csv, "../../../data/america/states_america.csv")
  .await(analyze);

function analyze(error, dataToUse){
  data=dataToUse;

  for(var i=0; i<dataToUse.length; i++){
    data[i].act_educ = Math.round(+dataToUse[i].educ/60);
    data[i].act_leisure = Math.round(+dataToUse[i].leisure/60);
    data[i].act_pcare = Math.round(+dataToUse[i].pcare/60);
    data[i].act_social = Math.round(+dataToUse[i].social/60);
    data[i].act_sports = Math.round(+dataToUse[i].sports/60);
    data[i].act_work = Math.round(+dataToUse[i].work/60);
    data[i].educ_perc = +dataToUse[i].act_educ;
    data[i].leisure_perc = +dataToUse[i].act_leisure;
    data[i].pcare_perc = +dataToUse[i].act_pcare;
    data[i].social_perc = +dataToUse[i].act_social;
    data[i].sports_perc = +dataToUse[i].act_sports;
    data[i].work_perc = +dataToUse[i].act_work;
    data[i].age = +dataToUse[i].age;
  }

  femaleData = data.filter(function(item){
    return item.sex=="Female";
  });

  maleData = data.filter(function(item){
    return item.sex=="Male";
  });
  layeredhistogram = new layeredHistogram("histogram",data,"act_leisure");
}

function updateChart(){
  layeredhistogram.wrangleData();
}

function processData(d) {
    d.average_work= +d.average_work;
    d.average_leisure= +d.average_leisure;
    d.average_pcare= +d.average_pcare;
    d.average_educ= +d.average_educ;
    return d;
}

function loaded(error,map,data) {
    USmap=map;
    timeuse=data;
    updateMap();
}

function getText(d,selectedValue) {
    var summary=
        "<p style='font-size: 20px; text-transform: uppercase; font-weight: bold; color: #ff775c'>" + d.properties.NAME +"</p>" +
        "<p>" + selectedValue + ": " + d3.round(d.properties[selectedValue]/60,2)+ " hours</p>"
    document.getElementById("content-1").innerHTML=summary;
}

function updateMap(){

    layeredhistogram.updateVis();

    s=d3.selectAll("path.countries")
    s.remove();

    s1=d3.selectAll(".rectangles")
    s1.remove()

    s2=d3.selectAll(".legend-labels")
    s2.remove()

    selectedValue=d3.select("#map-type").property("value");
    showExplanation(selectedValue);

    var min=d3.min(timeuse, function(d) {return +d[selectedValue]})
    var max=d3.max(timeuse, function(d) {return +d[selectedValue]})

    color.domain(d3.range(min, max, (max-min)/colors.length));

    var leg_labels=d3.range(min, max, (max-min)/colors.length);
    leg_labels.unshift("No Data"); // Add item to beginning of array

    var US = USmap.features

    for(var i=0; i<timeuse.length; i++){

        var dataCode = timeuse[i].states;

        for (var j = 0; j < US.length; j++) {
            var jsonCode = US[j].properties.NAME;
            if (dataCode == jsonCode) {
                US[j].properties[selectedValue]= timeuse[i][selectedValue];
                break;
            }
        }
    }
    tip1 = d3.tip().attr('class', '').html(function(d) {
        return (getText(d,selectedValue));
    });

    svg.call(tip1)

    svg.selectAll('path.countries')
        .data(US)
        .enter()
        .append('path')
        .attr('class', '')
        .attr('d', path)
        .attr('fill', function(d,i) {
            if(!isNaN(d.properties[selectedValue])){
                return color(d.properties[selectedValue]);
            }
            return "#e5e5e5";
        })
        .on('mouseover', function(d){
            layeredhistogram.wrangleData(d.properties.NAME);
            getText(d,selectedValue);
        })
        .on('mouseout', function(d){
            layeredhistogram.wrangleData("All States");
            document.getElementById("content-1").innerHTML="<p></p><p></p>";
        })

    var legend_group = svg.append("g")
        .attr("class", "")
        .attr("transform", "translate("+(width-120)+","+(height/2.5)+")");

    var legend = legend_group.selectAll('.rectangles')
        .data(leg_labels)
        .enter()
        .append('rect')
        .attr("class", "")
        .attr("x", 0)
        .attr("y", function(d, i){
            return i*30;
        })
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function(d,i){
            if(i==0){
                return "#e5e5e5";
            }
            else{
                return color(d);
            }
        });

    legend_group.selectAll("text")
        .data(leg_labels)
        .enter()
        .append('text')
        .attr("class", "")
        .attr("x", 40)
        .attr("y", function(d, i) {
            return i*30+15;
        })
        .text(function(d,i) {
            if(i<(leg_labels.length-1) && i!=0){
                return ((format(leg_labels[i]/60))+ "-" + (format(leg_labels[i+1]/60)));
            }
            else if (i==0) {
                return leg_labels[i];
            }
            else{
                return ((format(leg_labels[i]/60)) + "-" + (format(max/60)));
            }
        });
}

function showExplanation(selectedValue){
    var summary;
    if (selectedValue=="Average Work"){
        summary= "Work"
    }
    if (selectedValue=="Average Leisure"){
        summary= "Leisure"
    }
    if (selectedValue=="Average Educational Time"){
        summary= "Education"
    }
    if (selectedValue=="Average Personal Care"){
        summary= "Personal Care"
    }
    document.getElementById("update").innerHTML=summary;
}

layeredHistogram = function(_parentElement, _data) {

  this.parentElement = _parentElement;
  this.data = _data;
  this.femaleData = _data.filter(function(item){
    return item.sex=="Female";
  });
  this.maleData = _data.filter(function(item){
    return item.sex=="Male";
  });
  this.activity = selectedActivity(d3.select("#map-type").property("value"));
  this.initVis();
}

function selectedActivity(d) {
  switch (d) {
    case 'Average Work': return "act_work";
    case 'Average Leisure': return "act_leisure";
    case 'Average Personal Care': return "act_pcare";
    case 'Average Educational Time': return "act_educ";
  }
}


layeredHistogram.prototype.initVis = function() {

  var vis = this;

  vis.margin = { top: 40, right: 10, bottom: 60, left: 60 };

  vis.width = 400 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


  vis.x = d3.scale.linear()
    .range([0, vis.width])
    .domain([0,24]);

  vis.y = d3.scale.linear()
    .range([vis.height, 0]);

  vis.xAxis = d3.svg.axis()
    .scale(vis.x)
    .orient("bottom");

  vis.yAxis = d3.svg.axis()
    .scale(vis.y)
    .orient("left")
    .tickFormat(d3.format("%"));

  vis.svg.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0," + vis.height + ")");

  vis.svg.append("g")
    .attr("class", "y-axis axis");

  // label http://bl.ocks.org/phoebebright/3061203
  vis.svg.append("text")
    .attr("class", "title")
    .attr("x", (vis.width / 2))
    .attr("y", 0 - (vis.margin.top / 2))
    .attr("text-anchor", "middle");

  // now add titles to the axes
  vis.svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+(-vis.margin.left/1.5)+","+(vis.height/2)+") rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Frequency");

  vis.svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (vis.width/2) +","+(vis.height+vis.margin.bottom/1.5)+")")  // centre below axis
      .text("Hours");

  // Add a legend d3-legend.susielu.com/#usage
  vis.ordinal = d3.scale.ordinal()
      .domain(["Both", "Female", "Male"])
      .range(["rgba(255, 0, 0, 0.5)","rgba(0, 0, 255, 0.5)", "rgb(160, 32, 240)"]);

  vis.svg.append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", "translate("+(vis.width-70)+",0)");

  vis.legendOrdinal = d3.legend.color()
      .shapePadding(10)
      .scale(vis.ordinal);

  vis.svg.select(".legendOrdinal")
      .call(vis.legendOrdinal);

  vis.wrangleData("All States");
}


layeredHistogram.prototype.wrangleData = function(hoverState) {
  var vis = this;

  if(hoverState && hoverState!="All States"){
    state=hoverState;
    vis.displayFemaleData = vis.femaleData.filter(byState)
    vis.displayMaleData = vis.maleData.filter(byState)
  }
  else{
    state="All States"
    vis.displayFemaleData = vis.femaleData;
    vis.displayMaleData = vis.maleData;
  }
  vis.updateVis();
}

layeredHistogram.prototype.updateVis = function() {
  vis = this;

  vis.activity = selectedActivity(d3.select("#map-type").property("value"));

  vis.femaleValues = d3.layout.histogram()
    .frequency(false)
    .bins(vis.x.ticks(24))
    .value(function(d) { return d[vis.activity]; })
    (vis.displayFemaleData);

  // Male data values
  vis.maleValues = d3.layout.histogram()
    .frequency(false)
    .bins(vis.x.ticks(24))
    .value(function(d) { return d[vis.activity]; })
    (vis.displayMaleData);

  var femaleMax = d3.max(vis.femaleValues, function(d) { return d.y; });
  var maleMax = d3.max(vis.maleValues, function(d) { return d.y; });
  var yMax = d3.max([femaleMax,maleMax])+.05;

  vis.y.domain([0, yMax]);

  vis.bar1 = vis.svg.selectAll(".bar1").data(vis.femaleValues);

  vis.bar1.enter().append("g")
    .attr("class", "bar1")
    .attr("fill", "red")
    .attr("opacity", .5)
    .attr("transform", function(d) { return "translate(" + vis.x(d.x) + "," + vis.y(d.y) + ")"; });


  vis.bar1.append("rect")
    .attr("class", "rect1")
    .attr("x", 1)
    .attr("width", vis.x(vis.femaleValues[0].dx) - 1)
    .attr("height", function(d) { return vis.height - vis.y(d.y); });

  vis.bar1
    .transition()
    .attr("transform", function(d) { return "translate(" + vis.x(d.x) + "," + vis.y(d.y) + ")"; });

  vis.bar2 = vis.svg.selectAll(".bar2").data(vis.maleValues);

  vis.bar2.enter().append("g")
    .attr("class", "bar2")
    .attr("fill", "blue")
    .attr("opacity",.5)
    .attr("transform", function(d) { return "translate(" + vis.x(d.x) + "," + vis.y(d.y) + ")"; });

  vis.bar2
    .append("rect")
    .attr("class", "rect2")
    .attr("x", 1)
    .attr("width", vis.x(vis.maleValues[0].dx) - 1)
    .attr("height", function(d) { return vis.height - vis.y(d.y); });

  vis.bar2.transition()
    .attr("transform", function(d) { return "translate(" + vis.x(d.x) + "," + vis.y(d.y) + ")"; });

  vis.bar1.exit().remove();
  vis.bar2.exit().remove();

  for(var i=0; i<vis.bar2.selectAll(".rect2").length; i++){
    if(vis.bar2.selectAll(".rect2")[i].length>1){
      vis.bar2.selectAll(".rect2")[i]["0"].remove();
    }
  }

  for(var i=0; i<vis.bar1.selectAll(".rect1").length; i++){
    if(vis.bar1.selectAll(".rect1")[i].length>1){
      vis.bar1.selectAll(".rect1")[i]["0"].remove();
    }
  }

  d3.select("#state").text(state);

  vis.svg.select(".x-axis").call(vis.xAxis);
  vis.svg.select(".y-axis").call(vis.yAxis).transition().duration(800);
}

function actLabel(act){
  switch (act) {
    case 'act_work': return "Work";
    case 'act_leisure': return "Leisure";
    case 'act_pcare': return "Personal Care";
    case 'act_educ': return "Education";
  }
}

function byState(item) {
  return item.state==state;
}