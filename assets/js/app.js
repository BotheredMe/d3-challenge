var svgWidth = 960;
var svgHeight = 500;

var margin = {
top: 20,
right: 40,
bottom: 100,
left: 80
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// svg wrapper
var svg = d3
.select("#scatter")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);

// append svg
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "income";
var chosenYAxis ="healthcare";

function xScale(healthData, chosenXAxis) {
var xLinearScale = d3.scaleLinear()
  .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
    d3.max(healthData, d => d[chosenXAxis]) * 1.2])
  .range([0, width]);
return xLinearScale;
}

function yScale(healthData, chosenYAxis) {
var yLinearScale = d3.scaleLinear()
  .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
    d3.max(healthData, d => d[chosenYAxis]) * 1.2])
  .range([height, 0]);
return yLinearScale;
}

// click on axis
function renderXAxes(newXScale, xAxis) {
var bottomAxis = d3.axisBottom(newXScale);
xAxis.transition()
  .duration(1000)
  .call(bottomAxis);
return xAxis;
}

function renderYAxes(newYScale, yAxis) {
var leftAxis = d3.axisLeft(newYScale);
yAxis.transition()
  .duration(1000)
  .call(leftAxis);
return yAxis;
}

function renderCircles(circlesGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {
circlesGroup.transition()
  .duration(1000)
  .attr("cx", d => newXScale(d[chosenXAxis]))
  .attr("cy", d => newYScale(d[chosenYAxis]));
return circlesGroup;
}

function renderText(textGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {
textGroup.transition()
  .duration(1000)
  .attr("x", d => newXScale(d[chosenXAxis]))
  .attr("y", d => newYScale(d[chosenYAxis]));
return textGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {
var toolTip = d3.tip()
  .attr("class", "tooltip")
  .offset([80, -60])
  .html(function(d) {
    if (chosenXAxis === "income"){
      return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]} USD<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
    } else if (chosenXAxis === "age"){
      return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
    }    
    else {
      return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}%<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
    }
    });
   
circlesGroup.call(toolTip);
circlesGroup.on("mouseover", function(d) {
  toolTip.show(d,this);
  
  })
  .on("mouseout", function(d, index) {
    toolTip.hide(d);
  });
return circlesGroup;
}

// read csv
d3.csv("assets/data/data.csv").then(function(healthData) {
healthData.forEach(function(data) {
  data.abbr = data.abbr;
  data.healthcare = +data.healthcare;
  data.age = +data.age;
  data.income = +data.income;
  data.obesity = +data.obesity;
});

// set scales and axises
var xLinearScale = xScale(healthData, chosenXAxis);
var yLinearScale = yScale(healthData, chosenYAxis);
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

var circlesGroup = chartGroup.selectAll("circle")
  .data(healthData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", 18)
  .attr("fill", "blue")
  .attr("opacity", ".8");

var textGroup = chartGroup.selectAll("text")
  .exit()
  .data(healthData)
  .enter()
  .append("text")
  .text(d => d.abbr)
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]))
  .attr("text-anchor", "middle")
  .attr("class","stateText")
  .attr("pointer-events", "none");


circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


// labels
var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

var ageLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("class","axis-text-x")
  .attr("value", "age") 
  .classed("inactive", true)
  .text("Age (Median)");

var incomeLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("class","axis-text-x")
  .attr("value", "income") 
  .classed("active", true)
  .text("Income (Median)");

var ylabelsGroup = chartGroup.append("g");

var healthcareLabel = ylabelsGroup.append("text")
  .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
  .attr("dy", "1em")
  .attr("class","axis-text-y")
  .classed("axis-text", true)
  .attr("value", "healthcare") 
  .classed("active", true)
  .text("Lack of Healthcare (%)");

var obesityLabel = ylabelsGroup.append("text")
  .attr("transform", `translate(-80,${height / 2})rotate(-90)`)
  .attr("dy", "1em")
  .attr("class","axis-text-y")
  .attr("value", "obesity")
  .classed("inactive", true)
  .text("Obesity (%)");

labelsGroup.selectAll(".axis-text-x")
  .on("click", function() {
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
      chosenXAxis = value;
      xLinearScale = xScale(healthData, chosenXAxis);
      yLinearScale = yScale(healthData, chosenYAxis);
      xAxis = renderXAxes(xLinearScale, xAxis);
      circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
      textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);
      if (chosenXAxis === "age") {
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);      
      }else {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
});

ylabelsGroup.selectAll(".axis-text-y")
  .on("click", function() {
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {
    chosenYAxis = value;
   xLinearScale = xScale(healthData, chosenXAxis);
   yLinearScale = yScale(healthData, chosenYAxis);
   yAxis = renderYAxes(yLinearScale, yAxis);
   circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
   textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
   circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
   if (chosenYAxis === "healthcare") {
    healthcareLabel
      .classed("active", true)
      .classed("inactive", false);
    obesityLabel
      .classed("active", false)
      .classed("inactive", true);
    }
 else {
    healthcareLabel
      .classed("active", false)
      .classed("inactive", true);
    obesityLabel
      .classed("active", true)
      .classed("inactive", false);   
     }
  }
});
});

