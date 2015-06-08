// HELPER FUNCTION

// DEFINE RECT DRAW FUNCTIONS
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
				return d.discipline
				})

		return rects
}

function transitionRect(simulation) {
		//transition rect height based on new data
		svg.data(simulation)
			.attr("discipline",function(d) {
				return d.discipline
				})

		var rects = svg.selectAll("rect")
			.data(simulation)
			.transition()
			.attr("y",function(d) {
				return heightScale(Math.max(d.difference,0));
				})
			.attr("height", function(d) {
				return Math.abs(heightScale(0)-heightScale(d.difference));
				})


		return rects
}

// DEFINE DATA SIMULATION AND CALC FUNCTIONS
function createSimul(value, grade_data,growth_data) {
	// ARG: function to create the simulated data based on seed value and nwea data set
	// OUTPUT: the simulated grade level data 
	var simulation = [{
			grade: 1,
			rit: value,
			difference: 0,
			discipline: grade_data[0].discipline
			}];

	simulation[0].difference = findGradeDifference(simulation[0]
										,grade_data)


	// iterate through grades and simulate the growth
	for (var i = 0 ; i<5 ; i++ ) {
		//find the year long growth prediction for grade level and data 
		var matched_growth_data = findMatchedGrowthData(simulation[i],growth_data);

		// push new grade data to simulation
		simulation.push({
					grade: simulation[i].grade+1,
					rit: simulation[i].rit + parseInt(matched_growth_data[0].typicalfalltofallgrowth) ,
					difference: 0
		});
		
		simulation[i+1].difference = findGradeDifference(simulation[i+1],grade_data)

	}

	return simulation

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
			if (simulationj.rit < fall_grade_data[i+1].rit) {
								upper.grade = fall_grade_data[i+1].grade;
								upper.rit = fall_grade_data[i+1].rit;
					if (simulationj.rit > fall_grade_data[i].rit) {
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
	// TODO: update Reading to dropdown variable
	var matched_growth_data = growth_data.filter(function(d) { 
					return d.student_grade == simulationj.grade 
							&& d.rit == Math.round(simulationj.rit)
							&& d.discipline == "Reading";

				});
	// if no match found, then round to nearest multiple of 5
	// TODO: update Reading to dropdown variable
	if (matched_growth_data.length==0) {
				var matched_growth_data = growth_data.filter(function(d) { 
										return d.discipline  == "Reading" 
												&& d.student_grade == simulationj.grade 
												&& d.rit == Math.round(simulationj.rit/5)*5;
									});
	}

	return matched_growth_data
}
