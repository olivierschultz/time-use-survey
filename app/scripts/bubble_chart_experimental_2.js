var margin = {top: 10, right: 10, bottom: 10, left: 10};
const w = 1500 - margin.left - margin.right;
const h = 580 - margin.top - margin.bottom;
const n = 9;

var body = d3.select("body");
let dataset = [];
let acl = [];
let aclscales = [];
let aclValue = ["personalCare","sleep","eating","otherUnspecifiedPersonalCare",
  "employmentRelatedActivitiesAndTravelAsPartOfDuringMainAndSecondJob",
  "mainAndSecondJobAndRelatedTravel", "activitiesRelatedToEmploymentAndUnspecifiedEmployment",
  "schoolAndUniversityExceptHomework", "homework", "freeTimeStudy",
  "householdAndFamilyCare", "dishWashing", "cleaningDwelling", "laundry",
  "handicraftAndProducingTextilesAndOtherCareForTextiles", "gardeningOtherPetCare",
  "tendingDomesticAnimals", "constructionAndRepairs", "householdManagementAndHelpFamilyMember",
  "leisureSocialAndAssociativeLife", "organisationalWork", "informalHelpToOtherHouseholds",
  "participatoryActivities", "visitingAndFeasts", "otherSocialLife", "entertainmentAndCulture",
  "resting", "walkingAndHiking", "sportsAndOutdoorActivitiesExceptWalkingAndHiking",
  "computerGames", "computing", "hobbiesAndGamesExceptComputingAndComputerGames",
  "readingExceptBooks", "radioAndMusic", "unspecifiedLeisure",
  "travelExceptTravelRelatedToJobs", "travelToOrFromWork", "travelRelatedToStudy",
  "transportingAChild", "travelRelatedToLeisureSocialAndAssociativeLife",
  "unspecifiedTravel", "unspecifiedTimeUse"];



let timelist = [2000,2010];
let daysweeklist = ["Monday to Friday","Saturday to Sunday","All days of the week"];
let sexlist = ["Males","Females","Total"];
let attributes = ["cy", "cx", "fill", "r", "cy", "cx", "fill", "r","cy", "cx", "fill", "r"];

let aclscalesdict = {};
let aclfunctionsdict = {};
let attributesdict ={};


let selectorZone0 = body.append('div')
  .attr('id', 'selectZone0')
  .attr('class', "left")
  .style('position','absolute')
  .style('top', 10 + "px")
  .style('left', 10 + "px")
	.style('width', w/5 + 20 + "px")
	.style('height', h + "px")
  .style('background-color', 'Wheat');


var attributeZone = selectorZone0.append('div')
  .attr('id', 'attributeZone')
  .attr('width', w/5 + 20 + "px")
  .attr('height', h/5 + "px");
  //.style('background-color', 'green');

var selectorZone = selectorZone0.append('div')
  .attr('id', 'selectorZone')
  .style('top', 500 + "px")
  .attr('width', w/5 +20+ "px")
  .attr('height', 100 + "px");
  //.style('background-color', 'blue');


selectorZone.append("p")
              .text("ACL range selection zone (hh:mm)")
              .style("font-weight", "bold");

let graphZone = body.append('div')
  .attr('id', 'graph')
  .attr('class', "right")
  .style('position','absolute')
  .style('top', 10 + "px")
  .style('right', 10 + "px")
	.style('width', w - w/3 + "px")
	.style('height', h + "px");
//  .style('background-color', 'red');

var svg = graphZone.append('svg')
  .attr('id', 'svggraph')
  .attr('width', w - w/3 - 10)
  .attr('height',h - 10 )
  .style('background-color', 'Cornsilk');

  var div = d3.select("body").append("div")
  	.attr("class", "tooltip")
  	.style("opacity", 0)
  	.style("position", "absolute")
  	.style("text-align", "center")
  	.style("width", "100px")
  	.style("height", "20px")
  	.style("padding", "1px")
  	.style("font", "12px sans-serif")
  	.style("background", "lightgray")
  	.style("border", "0px")
  	.style("border-radius", "4px")
  	.style("pointer-events", "none");



/******My Functions********/

function convert(val) {
  	if (val != ":"){
  		var vals = val.split(":");
  		return parseInt(vals[0]) * 60 + parseInt(vals[1]);
  	}	else {
  		return 0;
  	}
  }

let aclfunctions = [
function filter1(colVal, threshold, currentY) {
  var randy = 0;
  if ((colVal > threshold)&(currentY > 260)) {
    randy = 10 + Math.random() * 250;
  } else if ((colVal < threshold)&(currentY < 310)){
    randy = 300 + Math.random() * 230;
  }else {
    randy = currentY;
  }
  return randy;
},
function filter2(colVal, threshold, currentX) {
  var randx = 0;
  if ((colVal > threshold)&(currentX > 460)){
    randx = 10 + Math.random() * 450;
  } else if ((colVal < threshold)&(currentX < 510)){
    randx = 500 + Math.random() * 450;
  }else {
    randx = currentX;
  }
  return randx;
},
function filter3(colVal, threshold, currentColor) {
  var randx = "red";
  if (colVal > threshold){
    randx = "red";
  }else {
    randx = "blue";
  }
  return randx;
},
function filter4(colVal, threshold, currentR) {
  var randx = 5;
  if (colVal > threshold){
    randx = 5;
  }else {
    randx = 10;
  }
  return randx;
},
function filter5(colVal, threshold, currentY) {
  var randy = 0;
  if ((colVal > threshold)&(currentY > 260)) {
    randy = 10 + Math.random() * 250;
  } else if ((colVal < threshold)&(currentY < 310)){
    randy = 300 + Math.random() * 230;
  }else {
    randy = currentY;
  }
  return randy;
},
function filter6(colVal, threshold, currentX) {
  var randx = 0;
  if ((colVal > threshold)&(currentX > 460)){
    randx = 10 + Math.random() * 450;
  } else if ((colVal < threshold)&(currentX < 510)){
    randx = 500 + Math.random() * 450;
  }else {
    randx = currentX;
  }
  return randx;
},
function filter7(colVal, threshold, currentColor) {
  var randx = "red";
  if (colVal > threshold){
    randx = "red";
  }else {
    randx = "blue";
  }
  return randx;
},
function filter8(colVal, threshold, currentR) {
  var randx = 5;
  if (colVal > threshold){
    randx = 5;
  }else {
    randx = 10;
  }
  return randx;
},
function filter9(colVal, threshold, currentY) {
  var randy = 0;
  if ((colVal > threshold)&(currentY > 260)) {
    randy = 10 + Math.random() * 250;
  } else if ((colVal < threshold)&(currentY < 310)){
    randy = 300 + Math.random() * 230;
  }else {
    randy = currentY;
  }
  return randy;
},
function filter10(colVal, threshold, currentX) {
  var randx = 0;
  if ((colVal > threshold)&(currentX > 460)){
    randx = 10 + Math.random() * 450;
  } else if ((colVal < threshold)&(currentX < 510)){
    randx = 500 + Math.random() * 450;
  }else {
    randx = currentX;
  }
  return randx;
},
function filter11(colVal, threshold, currentColor) {
  var randx = "red";
  if (colVal > threshold){
    randx = "red";
  }else {
    randx = "blue";
  }
  return randx;
},
function filter12(colVal, threshold, currentR) {
  var randx = 5;
  if (colVal > threshold){
    randx = 5;
  }else {
    randx = 10;
  }
  return randx;
}
];


function draw() {
  for (var i = 0; i < n; i++) {
    aclfunctionsdict[aclValue[i]] = aclfunctions[i];
    attributesdict[aclValue[i]] = attributes[i];
  }
  var circles = svg.selectAll("circle")
                   .data(dataset, function(d){return d.geo;})
                   .enter()
                   .append("circle")
                   .attr('id', (d,i) => "circle" + i)
                   .attr("cx", function(d) {
                     var randx = 10 + Math.random() * (w - w/3 - 50);
                     return randx;
                   })
                   .attr("cy", function(d) {
                     //console.log(d["personalCare"])
                     var randx = 10+ Math.random() * (h-30);
                     return randx;
                   })
                   .style("opacity", 0.9)
                   .attr("r", 5)
                   .attr("fill", "red")
                   .on("mouseover", function(d) {
                     div.transition().duration(500).style("opacity", 0.9);
                     div.html(d.geo)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                      })
                   .on("mouseout", function() {
                      div.transition().duration(500).style("opacity", 0);
                      });

/*
  var texts = svg.selectAll("text")
		               .data(dataset, function(d){return d.geo;})
		               .enter()
		               .append("text")
                   .attr('id', (d,i) => "text" + i)
                   .text(function(d) {
                     return d.geo;
                   })
                   .attr("x", function(d,i) {
                     var tx = svg.select("#"+"circle"+i).attr("cx");
                     return tx;
                   })
                   .attr("y", function(d,i) {
                     var ty = svg.select("#"+"circle"+i).attr("cy");
                     return ty;
                   })
                   .attr("font-family", "sans-serif")
                   .attr("font-size", "12px")
                   .attr("fill", "darkred");

*/
  attributeZone.append('select')
    .attr('class','inputTime')
    .on('change',function () {
      var timeChoice = d3.select('.inputTime').property('value');
      console.log("timeChoice: ", timeChoice);
      d3.selectAll('circle')
        .filter(function(d) {
             return d3.select(this).style("opacity") == 0.9;
           })
        .transition()
        .duration(1000)
        .style("opacity",function (d) {
          if (d.time == timeChoice){
            return 0.9;
          }else {
            return 0;
          }
        });
    })
    .selectAll('option')
      .data(timelist)
      .enter()
      .append('option')
      .attr('value',function (d) { return d })
      .text(function (d) { return d});

  attributeZone.append('select')
    .attr('class','inputWeek')
    .on('change',function () {
      var weekChoice = d3.select('.inputWeek').property('value');
      console.log("weekChoice: ", weekChoice);
      d3.selectAll('circle')
        .filter(function(d) {
             return d3.select(this).style("opacity") == 0.9;
           })
        .transition()
        .duration(1000)
        .style("opacity",function (d) {
          if (d.daysweek == weekChoice){
            return 0.9;
          }else {
            return 0;
          }
        });
    })
    .selectAll('option')
      .data(daysweeklist)
      .enter()
      .append('option')
      .attr('value',function (d) { return d })
      .text(function (d) { return d});

  attributeZone.append('select')
    .attr('class','inputSex')
    .on('change',function () {
      var sexChoice = d3.select('.inputSex').property('value');
      console.log("sexChoice: ", sexChoice);
    	d3.selectAll('circle')
        .filter(function(d) {
             return d3.select(this).style("opacity") == 0.9;
           })
    	  .transition()
    	  .duration(1000)
        .style("opacity",function (d) {
          if (d.sex == sexChoice){
            return 0.9;
          }else {
            return 0;
          }
        });
    })
    .selectAll('option')
      .data(sexlist)
      .enter()
      .append('option')
      .attr('value',function (d) { return d })
      .text(function (d) { return d});


attributeZone.append('button')
  .attr("type","button")
  .text("Reset")
  .on('click', function() {
    d3.selectAll('circle')
      .transition()
      .duration(1000)
      .style("opacity",0.9)
      .attr("fill", "red")
      .attr("r", 5);
   console.log("Pressed");
  });

  for (var i = 0; i < n; i++) {
    var colname = aclValue[i];
    var maxa = aclscales[i].invert(w/6)/60;
    var  acldivselector = selectorZone.append("div")
                                      .attr('id', colname)
                                      .text(colname.slice(0,33))
                                      .attr("font-size", "12px");

    acldivselector.append('br');
    acldivselector.append('input')
                  .attr('id', "slider" + colname)
                  .attr('class','inputThreshold'+colname)
                  .attr('type','range')
                  .attr('min', 0)
                  .attr('max', w/6)
                  .attr('step',1)
                  .attr('value', w/6);

    acldivselector.append('text').attr('id',"text"+colname).text(Math.floor(maxa)+ ":" + Math.ceil((maxa-Math.floor(maxa))*60)).style("color", "slategray");

     var slider = acldivselector.select("#" + "slider" + colname);
     slider.on("change", function(){
       //console.log("======",this.classList[0])
       var colAclvalue = this.classList[0].substr(14);
       var colfunction = aclfunctionsdict[colAclvalue];
       var colAttr = attributesdict[colAclvalue];
       var colscaled = aclscalesdict[colAclvalue];
       var thresholdChoice = d3.select('.'+ this.classList[0]).property('value');
           console.log("aclname: ", colAclvalue);
           console.log("thresholdChoice: ", thresholdChoice);
           console.log("function: ", colfunction);
           console.log("scale:", colscaled)
           console.log("colAttr: ", colAttr);

           var t = colscaled.invert(thresholdChoice)/60;
           selectorZone.select("#"+"text"+colAclvalue).text( Math.floor(t)+ ":" + Math.ceil((t-Math.floor(t))*60));
           svg.selectAll('circle')
              .transition()
              .duration(1000)
              .attr(colAttr, function(d) {
                var current = d3.select(this).attr(colAttr);
                    return colfunction(colscaled(d[colAclvalue]), thresholdChoice, current);
                    })
           });

  }

/*        svg.selectAll('text')
           .transition()
           .duration(1000)
           .attr("x", function(d,i) {
             var tx = svg.select("#"+"circle"+i).attr("cx");
             return tx;
           })
           .attr("y", function(d,i) {
             var ty = svg.select("#"+"circle"+i).attr("cy");
             return ty;
           });*/




}


d3.csv("../data/europe/bubble_chart_experimental_2.txt")
	.row( (d, i) => {
		return {
			unit: d["UNIT"],
			geo: d["GEO"],
			time: +d.TIME,
			daysweek: d["DAYSWEEK"],
			sex: d["SEX"],
      total: convert(d["Total"]),
      personalCare: convert(d["Personal care"]),
      sleep: convert(d["Sleep"]),
      eating: convert(d["Eating"]),
      otherUnspecifiedPersonalCare: convert(d["Other and/or unspecified personal care"]),
      employmentRelatedActivitiesAndTravelAsPartOfDuringMainAndSecondJob: convert(d["Employment, related activities and travel as part of/during main and second job"]),
      mainAndSecondJobAndRelatedTravel: convert(d["Main and second job and related travel"]),
      activitiesRelatedToEmploymentAndUnspecifiedEmployment: convert(d["Activities related to employment and unspecified employment"]),
      schoolAndUniversityExceptHomework: convert(d["School and university except homework"]),
      homework: convert(d["Homework"]),
      freeTimeStudy: convert(d["Free time study"]),
      householdAndFamilyCare: convert(d["Household and family care"]),
      dishWashing: convert(d["Dish washing"]),
      cleaningDwelling: convert(d["Cleaning dwelling"]),
      laundry: convert(d["Laundry"]),
      handicraftAndProducingTextilesAndOtherCareForTextiles: convert(d["Handicraft and producing textiles and other care for textiles"]),
      gardeningOtherPetCare: convert(d["Gardening"]),
      tendingDomesticAnimals: convert(d["Tending domestic animals"]),
      constructionAndRepairs: convert(d["Construction and repairs "]),
      householdManagementAndHelpFamilyMember: convert(d["Household management and help family member"]),
      leisureSocialAndAssociativeLife: convert(d["Leisure, social and associative life"]),
      organisationalWork: convert(d["Organisational work"]),
      informalHelpToOtherHouseholds: convert(d["Informal help to other households"]),
      participatoryActivities: convert(d["Participatory activities"]),
      visitingAndFeasts: convert(d["Visiting and feasts"]),
      otherSocialLife: convert(d["Other social life"]),
      entertainmentAndCulture: convert(d["Entertainment and culture"]),
      resting: convert(d["Resting"]),
      walkingAndHiking: convert(d["Walking and hiking"]),
      sportsAndOutdoorActivitiesExceptWalkingAndHiking: convert(d["Sports and outdoor activities except walking and hiking"]),
      computerGames: convert(d["Computer games"]),
      computing: convert(d["Computing"]),
      hobbiesAndGamesExceptComputingAndComputerGames: convert(d["Hobbies and games except computing and computer games"]),
      readingExceptBooks: convert(d["Reading, except books"]),
      radioAndMusic: convert(d["Radio and music"]),
      unspecifiedLeisure: convert(d["Unspecified leisure "]),
      travelExceptTravelRelatedToJobs: convert(d["Travel except travel related to jobs"]),
      travelToOrFromWork: convert(d["Travel to/from work"]),
      travelRelatedToStudy: convert(d["Travel related to study"]),
      transportingAChild: convert(d["Transporting a child"]),
      travelRelatedToLeisureSocialAndAssociativeLife: convert(d["Travel related to leisure, social and associative life"]),
      unspecifiedTravel: convert(d["Unspecified travel"]),
      unspecifiedTimeUse: convert(d["Unspecified time use"])
		};
	})
	.get( (error, rows) => {
		console.log("Loaded " + rows.length + " rows");
		if (rows.length > 0) {
			//console.log("First row: ", rows[0]);
			//console.log("Last row: ", rows[rows.length-1]);
			//console.log("Row 10: ", rows[10]);
			//console.log("Row 1000: ", rows[1000]);
			//console.log("Row 1600: ", rows[1600]);
		}
		dataset = rows;

// acl
    for(var i = 0, size = dataset.columns.length; i < size ; i++){
  	   if(i > 5){
  	      acl.push(dataset.columns[i]);
  	   }
    }

// scales
    for (var i = 0; i < n; i++) {
      var aclsale = d3.scaleLinear()
                            .domain([
                              d3.min(dataset, function(d) { return d[aclValue[i]]; }),
                              d3.max(dataset, function(d) { return d[aclValue[i]]; })])
                            .range([0, w/6]);
      aclscales.push(aclsale);
      aclscalesdict[aclValue[i]] = aclsale;
    }


		draw();
	});
