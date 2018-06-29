/*
	this V4 verison integrates actual data, added external values:
	happiness, random (pib, CO2)
*/

// set the dimensions and margins of the graph
// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 50, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var daySelector = "dAll";
var genderSelector = "All";
var xAxisSelector = "fun";
var yAxisSelector = "work";
var yearSelector = "2000";
var exogenSelector = "happyness";
var countrySelector = Array();
let dataset = [];

var back_color = "#708090";


d3.select("body").append("div").attr("id", "masterDiv")

let selector = d3.select("#masterDiv")
			.append("div").attr("id", "selector").style("width", "15%").style("float", "left");



let graph = d3.select("#masterDiv")
			.append("div")
			.attr("id", "graph")
			.style("width", "85%")
			.style("float", "right")
			.style("text-aling", "center");



	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
var svg = graph.append("svg")
			.attr("id", "mainChart")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		 	.append("g")
		    .attr("transform",
		          "translate(" + margin.left + "," + margin.top + ")");


let affichage = d3.select("#masterDiv")
			.append("div")
			.attr("id", "table")
			.style("text-align", "right")
			.append("g")
		    .attr("transform",
		          "translate(" + margin.left +")");

var table = affichage.append("table");
 	var table_title =table.append("tr");
		table_title.append("th").attr("class", "pays").text("Pays");
	 	table_title.append("th").attr("class", "year").text("year");
	 	table_title.append("th").attr("class", "gender").text("gender");
		table_title.append("th").attr("class", "exo").text(exogenSelector);
		table_title.append("th").attr("class", "phi").text(xAxisSelector);
		table_title.append("th").attr("class", "rho").text(yAxisSelector);




var categories = {'fun':'Fun', 'work':'Work', 'personalCare': 'Personal Care',
						'household': 'Household', 'study': 'Study', 'travel': 'Travel', 'unspec': 'Unspecified'};

var exogeneous = {'happyness': 'Happyness', 'rand_1': "Rand_1", 'rand_2': "Rand_2", 'rand_3': 'Rand_3'};

var countryList = ['Austria', 'Belgium', 'Bulgaria', 'Estonia', 'Finland', 'France',
       'Germany', 'Greece', 'Hungary', 'Italy', 'Latvia', 'Lithuania',
       'Luxembourg', 'Netherlands', 'Norway', 'Poland', 'Romania',
       'Serbia', 'Slovenia', 'Spain', 'United Kingdom'];



// declaration des fonctions utiles
String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}


// chargement des données:

d3.csv("../../data/happiness.csv")
	.row(function(d) {
       var parseD = d3.timeParse("%H:%M");
       return {

           sex: d.SEX,
           day: d.DAYSWEEK,
           year: d.TIME,
           city: d.GEO,
           fun: parseD(d.leisure),
           work: parseD(d.emp),
           personalCare: parseD(d.pc),
           household: parseD(d.household),
           study: parseD(d.study),
           travel: parseD(d.travel),
           unspec: parseD(d.unspec),
           happyness : +d.happyness,
           rand_1: +d.RAND_1,
           rand_2: +d.RAND_2,
           rand_3: +d.RAND_3

       };
  })

	.get( (error, rows) => {
		//handle error or vis of error
		console.log("loaded " + rows.length + " rows");
		if (rows.length > 0){
			console.log("First row", rows[0])
			console.log("Last row", rows[rows.length-1])
			dataset = rows;
			console.log("dset:", dataset)

			draw();
		};
	});


/* *******************************************************
************ Définition de la zone selector **************
********************************************************* */


selector.append("form")

// Selecteur du genre type.bouton Male / Female / Both
var form_gender = selector.select("form").append("fieldset");
		// sur le changement de selection, mise à jour de la variable
		// et refresh graph

		form_gender.append("legend").text("Gender");

		form_gender.append("button")
		.attr("class", "gender button")
		.attr("active", "no")
		.attr("type", "button")
		.attr("name", "gender")
		.attr("value", "Female")
		.text("Female");

	   	form_gender.append("button")
	   	.attr("class", "gender button")
	   	.attr("active", "no")
		.attr("type", "button")
		.attr("name", "gender")
		.attr("value", "Male")
		.text("Male");

	    form_gender.append("button")
	    .attr("class", "gender button")
	    .attr("active", "yes")
		.attr("type", "button")
		.attr("name", "gender")
		.attr("value", "All")
		.text("Both");


		var inputGender = d3.selectAll("button[name=gender]");

			inputGender.on("click", selectGender)

			function selectGender(){
				genderSelector = this.value;

				form_gender.selectAll("button").attr("active", "no");
				form_gender.select("button[value="+genderSelector+"]").attr("active", "yes");

				svg.selectAll("circle").attr("visibility", "hidden");
				refreshPlot();
			}

// Selecteur du genre type.radio  Week Days / days of weekend / Both
var form_day = selector.select("form").append("fieldset");
		// Selecteur du genre type.radio  Week Days / days of weekend / Both
		// sur le changement de selection, mise à jour de la variable
		// et refresh graph

		form_day.append("legend").text("Day Type");

	   	form_day.append("input")
	    	.attr("type", "radio")
	    	.attr("name", "day")
	    	.attr("value", "dD")
	    	//.text("Week Days");
		form_day.append("label")
			.html("Week Days" + "<br>");

		form_day.append("input")
	    	.attr("type", "radio")
	    	.attr("name", "day")
	    	.attr("value", "dW")
	    	.html("html Week-End Days");
		form_day.append("label")
			.html("Week-End"+ "<br>");

		form_day.append("input")
	    	.attr("type", "radio")
	    	.attr("name", "day")
	    	.attr("value", "dAll")
	    	.property("checked", true)
		form_day.append("label")
			.html("Both"+ "<br>");

	//gestion des changements
	var inputDays = d3.selectAll("input");

		inputDays.on("change", selectDay);

		function selectDay(){
			daySelector = this.value;
			svg.selectAll("circle").attr("visibility", "hidden");
			refreshPlot();
		}

// Selecteur du genre type bouton   2000 /  2010
var form_year = selector.select("form").append("fieldset");
		// sur le changement de selection, mise à jour de la variable
		// et redessine le graph, les données changent

		form_year.append("legend").text("Year");

		form_year.append("button")
	   	.attr("active", "yes")
		.attr("type", "button")
		.attr("name", "year")
		.attr("value", "2000")
		.text("2000");

	   	form_year.append("button")
	   	.attr("active", "no")
		.attr("type", "button")
		.attr("name", "year")
		.attr("value", "2010")
		.text("2010");

	//gestion des changements
	var inputYear = d3.selectAll("button[name=year]");

		inputYear.on("click", selectYear)

		function selectYear(){
			yearSelector = this.value;

			form_year.selectAll("button").attr("active", "no");
			form_year.select("button[value='"+yearSelector +"']").attr("active", "yes");

			svg.selectAll("circle").attr("visibility", "hidden");
			draw();
		}


// construction de la structures des formulaire selection axe x et axe y
	var form_x = selector.select("form").append("fieldset");
		form_x.append("legend").text("Selection variable absisse");
		form_x.append("select")
			.attr("id", "xaxis");

	var form_y = selector.select("form").append("fieldset");
		form_y.append("legend").text("Selection variable ordonnee");
		form_y.append("select")
			.attr("id", "yaxis");

	// construction de la liste de selection catégorie commune aux 2 axes:
	for (var key in categories) {

		form_x.select("#xaxis")
			.append("option")
			.attr("value", key)
			.text(categories[key]);

		form_y.select("#yaxis")
			.append("option")
			.attr("value", key)
			.text(categories[key]);
		}



	//definission ix, iy les option de selection par défaut
	/*
	var ix = Math.floor(Math.random() * categories.length);
	var iy = Math.floor(Math.random() * categories.length);
		while (ix == iy) {
			iy = Math.floor(Math.random() * categories.length);
		}

		// set des valeur par defaut
	var selectedX = document.getElementById("xaxis");
		selectedX.options[ix].defaultSelected = true;

	var selectedY = document.getElementById("yaxis");
		selectedY.options[iy].defaultSelected = true; */

	// definition des valeurs par défaut
	selector.select("#xaxis").property("value", xAxisSelector);
	selector.select("#yaxis").property("value", yAxisSelector);

	// gestion des changement

		selectedX = selector.select("#xaxis");
		selectedX.on("change", selectXAxis);

		function selectXAxis(){
			xAxisSelector = this.value; //selectedX.node().value;
			draw();
		}

		selectedY = selector.select("#yaxis");
		selectedY.on("change", selectYAxis);

		function selectYAxis(){
			yAxisSelector = selectedY.node().value;
			draw();
		}


// construction de la structures des formulaire selection donnée exogène
	var soc = selector.select("form").append("fieldset");
		soc.append("legend").text("Selection indicateur socio-economique");
		soc.append("select")
			.attr("id", "social");



	// construction de la liste de selection catégorie commune aux 2 axes:
	for (var key in exogeneous) {

		soc.select("#social")
			.append("option")
			.attr("value", key)
			.text(exogeneous[key]);

		}

	// definition des valeurs par défaut

	selector.select("#social").property("value", exogenSelector);

	selectedExo = selector.select("#social");
	selectedExo.on("change", selectExo);

	function selectExo(){
		exogenSelector = this.value; //selectedX.node().value;
		draw();
		}

// construction de la structures des formulaire selection country annoté
	var countryS = selector.select("form").append("fieldset");

				countryS.append("legend").text("Annotation pays");
				countryS.append("select")
					.attr("id", "countryS");



			// construction de la liste de selection catégorie commune aux 2 axes:
			for (var i in countryList) {

				countryS.select("#countryS")
					.append("option")
					.attr("value", countryList[i])
					.text(countryList[i]);

				}

			// definition des valeurs par défaut

			//selector.select("#countryS").property("value", exogenSelector); # pas de préselection

			selectedCountry = selector.select("#countryS");
			selectedCountry.on("change", selectCountry);

			function selectCountry(){
				var countryIndex = countrySelector.indexOf(this.value)
				if (countryIndex == -1) {
					countrySelector.push(this.value);
					console.log(this.value);
					annotateCountry(this.value, "add");
				}
				else {
					countrySelector.splice(countryIndex, 1);
					annotateCountry(this.value, "del");
				}


			}




/* ***********************************************************
************ Définition des fonctions de dessin **************
*************************************************************/


function draw(){



		table_title.select(".exo").text(exogenSelector);
		table_title.select(".phi").text(xAxisSelector);
		table_title.select(".rho").text(yAxisSelector);


	var timeFormater = d3.timeFormat("%H:%M");

	var parseD = d3.timeParse("%H:%M");

	function isTimeNull(timeData){
		return timeFormater(timeData) == timeFormater(parseD("00:00")); //timeData.getUTCMinutes() == 0 &&
	}


	// on définit les fonction de sclaes:

	xScale = d3.scaleLinear()
				.domain(d3.extent(dataset, (row) => row[xAxisSelector]))
				.range([20, width]);// on ajuste la taille d'affichage pour laisser de la place aux axes (20, w) au lieu de (0,w)

	yScale = d3.scaleLinear()
				.domain(d3.extent(dataset, (row) => row[yAxisSelector]))
				.range([height, 20]); // on ajuste la taille d'affichage pour laisser de la place aux axes (h-20)

	var timeFormater = d3.timeFormat("%H:%M");


	var circle = svg.selectAll("circle")
					.data(dataset.filter(function(d){return ((d.year == yearSelector) && !(isTimeNull(d[xAxisSelector])));})
								,function(d){return (d.sex + d.city + d.day).hashCode();})

					//.filter(function(d){ conlose.log(d[xAxisSelector] != 0 && d[yAxisSelector] != 0); return (d[xAxisSelector] != 0 && d[yAxisSelector] != 0);}) // [todo]: filtre x/y !+

				circle.exit()
					.transition()
					.duration(3000)
					.style("opacity", 0.1)
					.remove();

	// mise en forme des nouveaux points
	var nvx = circle.enter()
				.append("circle")
				.attr("class", (d) => (d.sex + " " + "y"+d.year + " " + "d"+d.day + " "+ d.city))
				.attr("visibility", "hidden")
				//.style("fill", back_color)
				.attr("marked", "no")
				.attr("cx", 0 )
				.attr("cy", 0 )
				.attr("r", (d) => (d[exogenSelector] * 10));

		// par défaut on affiche les 2 genres + jour Total
		svg.selectAll("."+daySelector+"."+genderSelector)
			.attr("visibility", "visible");




			nvx.transition()
				.duration(100)
				.attr("cx", (d) => xScale(d[xAxisSelector]) )
				.attr("cy", (d) => yScale(d[yAxisSelector]) )
				//.style("fill", back_color)
				.attr("r", (d) => d[exogenSelector]);


			circle.transition()
					.duration(3000)
					.attr("cx", (d) => xScale(d[xAxisSelector]) )
					.attr("cy", (d) => yScale(d[yAxisSelector]) )
					.attr("r", (d) => d[exogenSelector]);




		// par défaut on affiche les 2 genres + jour Total
		svg.selectAll("."+daySelector+"."+genderSelector)
			.attr("visibility", "visible");

		svg.append("g")
			.attr("class", "x_axis")
			.attr("transform", "translate(0," + height + ")");

		svg.select(".x_axis")
			.call(d3.axisBottom(xScale).ticks().tickFormat(function(d){return timeFormater(d); }));



		// text label for the x axis
		 svg.append("text")
		 	.attr("id", "x_title")
		 	.attr("class", "x_axis")
			.attr("transform",
			    "translate(" + (width/2) + " ," +
			                   (height + margin.top + 20) + ")")
			.style("text-anchor", "middle")

		svg.select("#x_title").text(categories[xAxisSelector]);



		svg.append("g")
			.attr("class", "y_axis")
			.attr("transform", "translate( " + 20 + ", 0 )")

		svg.select(".y_axis")
			.call(d3.axisLeft(yScale).ticks().tickFormat(function(d){return timeFormater(d); }));

		// text label for the y axis
		svg.append("text")
			.attr("id", "y_title")
			.attr("class", "y_axis")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - (margin.left - 10))
			.attr("x",0 - (height / 2))
			.attr("dy", "1em")
			.style("text-anchor", "middle")

		svg.select("#y_title").text(categories[yAxisSelector]);//.style("fill", "antiquewhite");


		svg.append("text")
			.attr("class", "titre_graph")
	        .attr("text-anchor", "left")
	        .style("font-size", "28px")
	        .style("fill", "orange")
	        .text("Comparaison dynamique du l'utilisation du temps et impact socio-économique");
/*
		.style("text-anchor", "left")
	        .style("font-size", "32px")
	        .style("fill", "orange") ;

d3.select("#titre_graph").append("h1").text("Comparaison dynamique du l'utilisation du temps <br />et impact socio-économique");
*/


var tltp = d3.select("body")
	    .append("div")
	    .attr("class", "tooltip")
	    .style("position", "fixed");
	    //.style("opacity", 0);

	    d3.selectAll("circle").on("mouseover", function(d) {
    		d3.select(this).style("opacity", 0.3);

			if (d3.select(this).attr("cy") - 50 > 0){

		    	tltp.style("top", d3.select(this).attr("cy")) // + "px"
		    		.style("left", d3.select(this).attr("cx")); // + "px"
		    	}
		    else {

		    	tltp.style("top", d3.select(this).attr("cy")) // + "px"
		    		.style("left", d3.select(this).attr("cx")); // + "px"
		    }

		    tltp.style("visibility", "visible")
		    	.html("<h1>" + d.city + "</h1> <hr>" +
		    			'année: ' + yearSelector + "<br />"  +
	    				exogenSelector + ": " + d[exogenSelector] + "<br />" +
	    				xAxisSelector + ": " + timeFormater(d[xAxisSelector]) + "<br />" +
	    				yAxisSelector + ": " + timeFormater(d[yAxisSelector]));
		  	})



		d3.selectAll("circle").on("mouseout", function() {
	    			tltp.style("visibility", "hidden");
	    			d3.select(this).style("opacity", 1);


  			});

		d3.selectAll("circle").on("click", selectCountryByClic);


  		function selectCountryByClic(d){
				var countryIndex = countrySelector.indexOf(d.city);
				console.log(d3.select(d.city));
				if (countryIndex == -1) {
					countrySelector.push(d.city);
					annotateCountry(d.city, "add");

				}
				else {
					countrySelector.splice(countryIndex, 1);
					annotateCountry(d.city, "del");

				}

			}




	 };

function refreshPlot() {
// gere l'affichage des filtres genre / days
	console.log("genderSelector: " + genderSelector + "\ndaySelector: "+daySelector +"\nyearSelector: "+yearSelector);
	svg.selectAll("."+genderSelector+"."+daySelector)
		.attr("visibility", "visible");

	}


function annotateCountry(pays, act) {

	if (act == "del") {
		svg.selectAll("."+pays)
				.attr("marked", "no");
				tableRemoveLine(pays);
			}
			//.style("stroke", "white")
			//.style("stroke-width", 1)


	if (act == "add") {
		toAnnote = svg.selectAll("circle."+pays)
			.attr("marked", "yes");
		svg.selectAll("circle."+pays+"[visibility=visible]").each(function(d) {tableAddLine(d)});
			}

	refreshPlot();

	}


function tableAddLine(d){

	console.log("<<<<<<"+d);
	var timeFormater = d3.timeFormat("%H:%M");

		var newLine = table.append("tr").attr("id", d.city);

					newLine.append("td").text(d.city);
					newLine.append("td").text(d.year);
					newLine.append("td").text(d.sex);
					newLine.append("td").text(d[exogenSelector]);
					newLine.append("td").text(timeFormater(d[xAxisSelector]));
					newLine.append("td").text(timeFormater(d[yAxisSelector]));

		}

function tableRemoveLine(city){

		table.select("#"+city).remove();

		}







