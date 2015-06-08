<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='utf-8'>

  <title>dc.js Experiment</title>

  <script src='d3.v3.js' type='text/javascript'></script>
  <script src='crossfilter.js' type='text/javascript'></script>
  <script src='dc.js' type='text/javascript'></script>
  <script src='jquery-1.9.1.min.js' type='text/javascript'></script>
  <script src='bootstrap.min.js' type='text/javascript'></script>

  <link href='bootstrap.min.css' rel='stylesheet' type='text/css'>
  <link href='dc.css' rel='stylesheet' type='text/css'>

  <style type="text/css"></style>
  
  <style>
    h4 span {
      font-size:14px;
      font-weight:normal;
      }
    h2 {
      float: right;
    }
    h2 span {
      font-size:14px;
      font-weight:normal;
      }
  </style>
</head>

<body>

<div class='container' style='font: 12px sans-serif;'>
  <div class="dc-data-count" style="float: left;">
    <h2>New Zealand Earthquakes
      <span>
        <span class="filter-count"></span>
         selected out of 
        <span class="total-count"></span>
         records | 
        <a href="javascript:dc.filterAll(); dc.renderAll();">Reset All</a>
      </span>
    </h2>
  </div>
    
  <div class='row'>
    <div class='span6' id='dc-magnitude-chart'>
      <h4>
		Number of Events by Magnitude
        <span>
          <a class="reset"
            href="javascript:magnitudeChart.filterAll();dc.redrawAll();"
            style="display: none;">
            reset
          </a>
        </span>
	  </h4>
    </div>
    <div class='span6' id='dc-depth-chart'>
	  <h4>
		Events by Depth (km)
        <span>
          <a class="reset"
            href="javascript:depthChart.filterAll();dc.redrawAll();"
            style="display: none;">
            reset
          </a>
        </span>
      </h4>
    </div>   
  </div>

  <div class='row'>
    <div class='span12' id='dc-time-chart'>
      <h4>
		Events per hour
        <span>
          <a class="reset"
            href="javascript:timeChart.filterAll();dc.redrawAll();"
            style="display: none;">
            reset
          </a>
        </span>
	  </h4>
    </div>
  </div>

  <div class='row'>
    <div class='span4' id='dc-dayweek-chart'>
      <h4>
        Day of the Week
        <span>
          <a class="reset"
            href="javascript:dayOfWeekChart.filterAll();dc.redrawAll();"
            style="display: none;">
            reset
          </a>
        </span>
      </h4>
        <div class="clearfix"></div>
    </div>
    <div class='span4' id='dc-island-chart'>
	  <h4>
		North or South Island
        <span>
          <a class="reset"
            href="javascript:islandChart.filterAll();dc.redrawAll();"
            style="display: none;">
            reset
          </a>
        </span>
      </h4>
    </div>   
    <div class='span4' id='blank2'>
	  <h4>Blank 2</h4>
    </div> 
  </div>

  <div class='row'>
	<div class='span12'>
      <table class='table table-hover' id='dc-table-graph'>
        <thead>
          <tr class='header'>
            <th>DTG</th>
            <th>Lat</th>
            <th>Long</th>
            <th>Depth</th>
            <th>Magnitude</th>
            <th>Google Map</th>
            <th>OSM Map</th>
          </tr>
        </thead>
      </table>
	</div>
  </div>
</div>
  
<script type="text/javascript">

// Create the dc.js chart objects & link to div
var dataTable = dc.dataTable("#dc-table-graph");
var magnitudeChart = dc.barChart("#dc-magnitude-chart");
var depthChart = dc.barChart("#dc-depth-chart");
var dayOfWeekChart = dc.rowChart("#dc-dayweek-chart");
var islandChart = dc.pieChart("#dc-island-chart");
var timeChart = dc.lineChart("#dc-time-chart");

// load data from a csv file
d3.csv("quake-later3.csv", function (data) {

  // format our data
  var dtgFormat = d3.time.format("%Y-%m-%dT%H:%M:%S");
  var dtgFormat2 = d3.time.format("%a %e %b %H:%M");
  
  data.forEach(function(d) { 
    d.dtg1  = d.origintime.substr(0,10) + " " + d.origintime.substr(11,8);
    d.dtg   = dtgFormat.parse(d.origintime.substr(0,19)); 
    d.lat   = +d.latitude;
    d.long  = +d.longitude;
    d.mag   = d3.round(+d.magnitude,1);
    d.depth = d3.round(+d.depth,0);
   
  });

  // Run the data through crossfilter and load our 'facts'
  var facts = crossfilter(data);
  var all = facts.groupAll();

  // for Magnitude
  var magValue = facts.dimension(function (d) {
    return d.mag;       // add the magnitude dimension
  });
  var magValueGroupSum = magValue.group()
    .reduceSum(function(d) { return d.mag; });	// sums 
  var magValueGroupCount = magValue.group()
    .reduceCount(function(d) { return d.mag; }) // counts 

  // for Depth
  var depthValue = facts.dimension(function (d) {
    return d.depth;
  });
  var depthValueGroup = depthValue.group();

  // time chart
  var volumeByHour = facts.dimension(function(d) {
    return d3.time.hour(d.dtg);
  });
  var volumeByHourGroup = volumeByHour.group()
    .reduceCount(function(d) { return d.dtg; });

  // row chart Day of Week
  var dayOfWeek = facts.dimension(function (d) {
    var day = d.dtg.getDay();
    switch (day) {
      case 0:
        return "0.Sun";
      case 1:
        return "1.Mon";
      case 2:
        return "2.Tue";
      case 3:
        return "3.Wed";
      case 4:
        return "4.Thu";
      case 5:
        return "5.Fri";
      case 6:
        return "6.Sat";
    }
  });
  var dayOfWeekGroup = dayOfWeek.group();

  // Pie Chart
  var islands = facts.dimension(function (d) {
    if (d.lat <= -40.555907 && d.long <= 174.590607)
      return "South";
    else
      return "North";
    });
  var islandsGroup = islands.group();

  // Create datatable dimension
  var timeDimension = facts.dimension(function (d) {
    return d.dtg;
  });

  // Setup the charts

  // count all the facts
  dc.dataCount(".dc-data-count")
    .dimension(facts)
    .group(all);
    
  // Magnitide Bar Graph Counted
  magnitudeChart.width(480)
    .height(150)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(magValue)
    .group(magValueGroupCount)
	.transitionDuration(500)
    .centerBar(true)	
	.gap(65)  // 65 = norm
//    .filter([3, 5])
    .x(d3.scale.linear().domain([0.5, 7.5]))
	.elasticY(true)
	.xAxis().tickFormat();	

  // Depth bar graph
  depthChart.width(480)
    .height(150)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(depthValue)
    .group(depthValueGroup)
	.transitionDuration(500)
    .centerBar(true)	
	.gap(1)  
    .x(d3.scale.linear().domain([0, 100]))
	.elasticY(true)
	.xAxis().tickFormat(function(v) {return v;});

  // time graph
  timeChart.width(960)
    .height(150)
    .transitionDuration(500)
//    .mouseZoomable(true)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(volumeByHour)
    .group(volumeByHourGroup)
//    .brushOn(false)			// added for title
    .title(function(d){
      return dtgFormat2(d.data.key)
      + "\nNumber of Events: " + d.data.value;
      })
	.elasticY(true)
    .x(d3.time.scale().domain(d3.extent(data, function(d) { return d.dtg; })))
    .xAxis();

  // row chart day of week
  dayOfWeekChart.width(300)
    .height(220)
    .margins({top: 5, left: 10, right: 10, bottom: 20})
    .dimension(dayOfWeek)
    .group(dayOfWeekGroup)
    .colors(d3.scale.category10())
    .label(function (d){
       return d.key.split(".")[1];
    })
    .title(function(d){return d.value;})
    .elasticX(true)
    .xAxis().ticks(4);

  // islands pie chart
  islandChart.width(250)
    .height(220)
    .radius(100)
    .innerRadius(30)
    .dimension(islands)
    .title(function(d){return d.value;})
    .group(islandsGroup);

  // Table of earthquake data
  dataTable.width(960).height(800)
    .dimension(timeDimension)
	.group(function(d) { return "Earthquake Table"
	 })
	.size(10)
    .columns([
      function(d) { return d.dtg1; },
      function(d) { return d.lat; },
      function(d) { return d.long; },
      function(d) { return d.depth; },
      function(d) { return d.mag; },
	  function(d) { return '<a href=\"http://maps.google.com/maps?z=12&t=m&q=loc:' + d.lat + '+' + d.long +"\" target=\"_blank\">Google Map</a>"},
	  function(d) { return '<a href=\"http://www.openstreetmap.org/?mlat=' + d.lat + '&mlon=' + d.long +'&zoom=12'+ "\" target=\"_blank\"> OSM Map</a>"}
    ])
    .sortBy(function(d){ return d.dtg; })
    .order(d3.ascending);

  // Render the Charts
  dc.renderAll();
  
});
  
</script>
    
</body>
</html>
