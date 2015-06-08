// HELPER FUNCTION
var lineFunction = d3.svg.line()
	.x(function(d,i){
			//TODO remove extra padding if axis adjusted 
			return padding.left + widthScale.rangeBand()/3 + (i) * widthScale.rangeBand();
			})
	.y(function(d){
			return heightScale(d.difference); 
		})  
	.interpolate("linear");

// DEFINE PATH DRAW FUNCTIONS (for line graph)
function drawPath(simulation) {
	// var path = svg.append("path")

	// var lineFunction = d3.svg.line()
	// 					.x(function(d,i){
	// 							//TODO remove extra padding if axis adjusted 
	// 							return padding.left + widthScale.rangeBand()/3 + (i) * widthScale.rangeBand();
	// 						})
	// 					.y(function(d){
	// 							return heightScale(d.difference); 
	// 						})  
	// 					.interpolate("linear");

	var lineGraph = svg.append("path")
						.attr("d",lineFunction(simulation))
						.attr("id","linegraph")
						.attr("stroke-width",2) ;

	return lineGraph;
}

//reset selection for discipline
function resetDiscipline(simulation) {
	// put a ceiling of 1.5 and floor of -1.5
	if (simulation[5].category==0) {
		var line_category = simulation[5].category;
	} else if (+simulation[5].category>=0) {
		var line_category = Math.min(1.5,simulation[5].category);
	} else {
		var line_category = Math.max(-1.5,simulation[5].category);
	}


	//TODO: how to clear path under #linegraph 
	var lineGraph = d3.selectAll("#linegraph")
						.transition()
						.duration(100)
						.attr("d"," ")
						.attr("category",line_category);
	
	return lineGraph;
}

//create path transition
function transitionPath(simulation){

	// put a ceiling of 1.5 and floor of -1.5
	if (simulation[5].category==0) {
		var line_category = simulation[5].category;
	} else if (+simulation[5].category>=0) {
		var line_category = Math.min(1.5,simulation[5].category);
	} else {
		var line_category = Math.max(-1.5,simulation[5].category);
	}

	// var lineFunction = d3.svg.line()
	// 					.x(function(d,i){
	// 							//TODO remove extra padding if axis adjusted 
	// 							return padding.left + widthScale.rangeBand()/3 + (i) * widthScale.rangeBand();
	// 						})
	// 					.y(function(d){
	// 							return heightScale(d.difference); 
	// 						})  
	// 					.interpolate("linear");

	var lineGraph = svg.append("path")
						.attr("d",lineFunction(simulation))
						.attr("id","linegraph")
						.attr("stroke-width",2) 
						.attr("category",line_category);

	return lineGraph;


	// var lineGraph = d3.select("#linegraph")
	// 					.transition()
	// 					.duration(100)
	// 					.attr("d",lineFunction(simulation))
	// 					.attr("category",line_category);
	
	// return lineGraph;
}

// DEFINE RECT DRAW FUNCTIONS (for bar graph)
function transitionText(simulation) {
	var difference = Math.round(simulation[0].difference*10)/10;

	var end_gl = Math.round(simulation[5].difference*10)/10;

	var discipline = simulation[0].discipline ;

	// text for student starting grade level
	if (difference==0) {
		var starting_text = "What happens to a student starting at grade level in "+discipline+"? ";
	} else if (difference>0) {
		var starting_text = "What happens to a student starting "+Math.abs(difference)+" grade level above peers in "+discipline+"? " ;
	} else if (difference <0) {
		var starting_text = "What happens to a student starting "+Math.abs(difference)+" grade level below peers in "+discipline+"? ";
	}

	// text for student ending grade level
	if (end_gl==0) {
		var ending_text = "By 6th grade, they are at grade level.";
	} else if (end_gl>0) {
		var ending_text = "By 6th grade, they are "+Math.abs(end_gl)+" above grade level";
	} else if (end_gl<0) {
		var ending_text = "By 6th grade, they are "+Math.abs(end_gl)+" below grade level";
	}

	all_text = starting_text + ending_text ;

	d3.select("#starting_gl")
		.transition()
		.text(all_text);

}

function drawRect(simulation) {

	//create initial plot data from simulation
	var rects = svg.selectAll("rect")
			.data(simulation)
			.enter()
			.append("rect");

	// define the attribute of the new data
	rects.attr("x", function(d,i) {
				return padding.left + i * widthScale.rangeBand();
			})
		.attr("y",function(d) {
				return heightScale(Math.max(d.difference,0));
			})
		.attr("height", function(d) {
			return Math.abs(heightScale(0)-heightScale(d.difference));
			})
		.attr("width", function(d) {
			return widthScale.rangeBand() - 10;
			}) 
		.attr("discipline",function(d) {
			return d.discipline;
			})
		.attr("difference",function(d) {
			return d.difference ;
			})
		.attr("rit",function(d) {
			return d.rit ;
			}) ;

	return rects;
}

function transitionRect(simulation) {
	//transition rect height based on new data
	var rects = svg.selectAll("rect")
		.data(simulation)
		.transition()
		.duration(1000)
		.attr("y",function(d) {
			return heightScale(Math.max(d.difference,0));
			})
		.attr("height", function(d) {
			return Math.abs(heightScale(0)-heightScale(d.difference));
			})
		.attr("discipline",function(d) {
			return d.discipline ;
			})
		.attr("difference",function(d) {
			return d.difference ;
			})
		.attr("rit",function(d) {
			return d.rit ;
			}) ; 

	return rects ; 
}

// DEFINE DATA SIMULATION AND CALC FUNCTIONS
//TODO: if change to nested data change filter structure 
function createSimul(value, grade_data,growth_data, discipline) {
	// ARG: function to create the simulated data based on seed value and nwea data set
	// OUTPUT: the simulated grade level data 

	// translate grade level value to rit score 
	var seed_rit = matchSeedGradeLevel(value, grade_data, discipline);

	// filter grade and growth data by discipline
	var grade_data = grade_data.filter(function(d) {
		return d.discipline == discipline ; 
	});
	var growth_data = growth_data.filter(function(d) {
		return d.discipline == discipline ; 
	});

	var category = Math.round(value / 0.5)*0.5 ; 

	var simulation = [{
			grade: 1,
			rit: +seed_rit,
			category: category,
			difference: value,
			discipline: grade_data[0].discipline
			}];

	// simulation[0].difference = findGradeDifference(simulation[0]
	// 									,grade_data)



	// iterate through grades and simulate the growth
	for (var i = 0 ; i<5 ; i++ ) {

		//find the year long growth prediction for grade level and data 
		var matched_growth_data = findMatchedGrowthData(simulation[i],growth_data);


		// push new grade data to simulation
		simulation.push({
					grade: simulation[i].grade+1,
					rit: simulation[i].rit + parseInt(matched_growth_data[0].typicalfalltofallgrowth) ,
					// category: category,
					difference: 0,
					discipline: grade_data[0].discipline
		});
		
		simulation[i+1].difference = findGradeDifference(simulation[i+1],grade_data) ;
		simulation[i+1].category = Math.round(simulation[i+1].difference /0.5)*0.5 ;
	}

	return simulation ; 
}

function matchSeedGradeLevel(seed_gl, fall_grade_data, discipline) {
	var below_grade_data = fall_grade_data.filter(function(d) {
		return d.discipline ==  discipline &&
				d.grade == 0 ; 
		})

	var on_grade_data = fall_grade_data.filter(function(d) {
		return d.discipline ==  discipline &&
				d.grade == 1 ; 
		})

	
	var above_grade_data = fall_grade_data.filter(function(d) {
		return d.discipline ==  discipline &&
				d.grade == 2 ; 
		})

	if (seed_gl ==0 ) { 
		var seed_rit = +on_grade_data[0].rit;
	} else if (seed_gl>0) {
		var seed_rit = +on_grade_data[0].rit + (above_grade_data[0].rit - on_grade_data[0].rit)*seed_gl;
	} else {
		var seed_rit = +on_grade_data[0].rit + (on_grade_data[0].rit - below_grade_data[0].rit)*seed_gl;
	}

	return seed_rit
}


function findGradeDifference(simulationj,fall_grade_data){
	// ARG: array with current grade / rit assumption, and json to matrix rit score with grade level
	// OUT: the difference from on grade level assumption
	var grade = 0;
	var lower = {grade: -1, rit: 0};
	var upper = {grade: -1, rit: 0} ;

	// iterate through fall_grade_data and find the matching grade level for seed data
	for (var i =8 ; i >= 0; i--) {
			// if seed rit score greater than current grade set lower value
			if (simulationj.rit <= fall_grade_data[i+1].rit) {
								upper.grade = fall_grade_data[i+1].grade;
								upper.rit = fall_grade_data[i+1].rit;
					if (simulationj.rit >= fall_grade_data[i].rit) {
								lower.grade = fall_grade_data[i].grade;
								lower.rit = fall_grade_data[i].rit;
							} 
			}
		}

	if (lower.grade<upper.grade) { 
			var denom = upper.rit - lower.rit;
			// the weight is inverse to the difference from lower and upper bound
			var lower_weight = (upper.rit - simulationj.rit) / denom  ;
			var upper_weight = (simulationj.rit - lower.rit ) / denom  ;
			simulationj.difference = upper_weight*upper.grade + lower_weight *lower.grade  - simulationj.grade;
			} 

	// if below kinder threshold set difference 
	if ( +simulationj.rit < fall_grade_data[0].rit ) {
			simulationj.difference = (simulationj.rit - fall_grade_data[0].rit)/20 - simulationj.grade  ; 
	}

	return simulationj.difference.toFixed(1)
}

function findMatchedGrowthData(simulationj,growth_data) {
	// find the year long growth prediction for grade level and data 
	// ARG: simulation item and growth data set
	var matched_growth_data = growth_data.filter(function(d) { 
					return d.student_grade == simulationj.grade 
							&& d.rit == Math.round(simulationj.rit);

				});
	// if no match found, then round to nearest multiple of 5
	if (matched_growth_data.length==0) {
				var matched_growth_data = growth_data.filter(function(d) { 
										return d.student_grade == simulationj.grade 
												&& d.rit == Math.round(simulationj.rit/5)*5;
									});
	}

	return matched_growth_data
}
