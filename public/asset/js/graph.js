import axios from "axios";

// set the dimensions and margins of the graph
let margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.select("#first-graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

(async () => {

    const medalsByBudjet = await axios.get(process.env.VPS + '/medals?year=2016')
    console.log('medals:', medalsByBudjet)

    //Read the data

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, 14000])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 150])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(medalsByBudjet.data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.none); })
        .attr("cy", function (d) { return y(d.silver); })
        .attr("r", 1.5)
        .style("fill", "#69b3a2")



})()
