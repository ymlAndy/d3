////////////////////////////////////////////////GLOBALS/////////////////////////////////////////////////////
//Declare dimensions & margin
const margin = {
  left: 50,
  right: 50,
  top: 25,
  bottom: 100
}

const chartDim = {
  width: 400,
  height: 350
}

//set up svg & graphing group
const g = d3.select("#chart-area")
  .append("svg")
  .attr("width", chartDim.width + margin.left + margin.right)
  .attr("height", chartDim.height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate (" + margin.left + "," + margin.top + ")");

//construct scales
const x = d3.scaleLog()
  .domain([300, 150000])
  .clamp(true)
  .range([0, chartDim.width]);

const y = d3.scaleLinear()
  .domain([0, 90])
  .range([chartDim.height, 0]);

let size = d3.scaleLinear()
  .range([5 ^ 2 * Math.PI, 20 ^ 2 * Math.PI]);

let colour = d3.scaleOrdinal()
  .range(["#fc6a52", "#a8d681", "#ffdd1c", "#5e83ba"]);

//animation controllers;
let interval;
let animateState = "Pause";
let selectContinent = [];
let selectTime = 0;

//construct year label
const yearLabel = g.append("text")
  .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
  .style("font-size", "150px")
  .style("text-anchor", "left")
  .style("fill", "#E8E8E8")
  .attr("transform", "translate(" + (chartDim.width) / 6 + "," + (chartDim.height + margin.top + margin.bottom) / 2 + ")")
////////////////////////////////////////////////INITIALISE/////////////////////////////////////////////////////
//LOAD DATA
d3.json("data/data.json", function(data) {
  let year = 0;
  const dataMax = data.length;
  //convert to numerical
  data.forEach(
    (d, i) => d.year = +d.year
  );

  //construct UI elements
  const yearSlider = document.getElementById("yearSlider");
  yearSlider.setAttribute("min", 0);
  yearSlider.setAttribute("max", dataMax - 1);
  yearSlider.setAttribute("value", 0);
  yearSlider.oninput = function() {
    pauseAnimation();
    //update slider as input
    selectTime = yearSlider.valueAsNumber;
    update(data, yearSlider.valueAsNumber);
  }

  const playButton = document.getElementById("play");
  playButton.onclick = function() {
    if (animateState == "Pause") {
      startAnimation();
    } else {
      pauseAnimation();
    }
  };

  //reset
  const resetButton = document.getElementById("reset");
  resetButton.onclick = resetAnimation;

  //animation functions
  function startAnimation() {
    animateState = "Play";
    playButton.innerHTML = "Pause";
    interval = setInterval(step, 500);
  }

  function pauseAnimation() {
    animateState = "Pause";
    playButton.innerHTML = "Play";
    clearInterval(interval);
  }

  function resetAnimation() {
    selectTime = 0;
    update(data, 0);
    yearSlider.value = 0;
  }

  function step() {
    if (selectTime < dataMax -1) {
      selectTime += 1
      yearSlider.stepUp();
      update(data, selectTime)
    } else {
      pauseAnimation();
    }
  }

  //dropdown
  Array.prototype.unique = function() {
    return this.filter(function(value, index, self) {
      return self.indexOf(value) === index;
    });
  }
  //.unique().replace(/\b\w/g, l => l.toUpperCase())
  const dropDown = document.getElementById("dropdown");
  let continents = [];
  let continentsCap = [];
  data.forEach(
    (d, i) => (
      continents.push(d.countries[i].continent)
    )
  );
  continents = continents.unique();
  continents.forEach(
    (d, i) => {
      continentsCap.push(d.replace(/\b\w/g, l => l.toUpperCase()))
    }
  )
  // let continents = [];
  // data.forEach(
  //   (d, i) => (
  //     continents.push(d.countries[i].continent)
  //   )
  // );
  // let continentUnique = continents.unique();
  // let selectContinent = continentUnique;
  // console.log(selectContinent);
  let continentsStr = "<option value='all'>All Continents</option>";
  continents.forEach(
    (d, i) => {
      continentsStr += "<option value = '" + continents[i].replace(/\b\w/g, l => l.toLowerCase()) + "'" + ">" + continentsCap[i] + "</option>" + "</br>";
    }
  );
  dropDown.innerHTML = continentsStr;
  setContinent();
  dropDown.onchange = function() {
    setContinent();
    update(data, selectTime);
  }

  function setContinent() {
    if (dropDown.value == "all") {
      selectContinent = continents;
    } else {
      selectContinent = [dropDown.value];
    }
  }

  // //construct X Axis
  const xAxis = d3.axisBottom(x).tickValues([100, 1000, 10000, 100000]).tickFormat(d3.format(",d"));
  g.append("g").attr("id", "xAxis").call(xAxis).attr("transform", "translate(0," + chartDim.height + ")");
  //construct X Axis Label
  g.append("text").text("GDP Per Capita ($)")
    .attr("x", chartDim.width / 2)
    .attr("y", chartDim.height + 35)
    .attr("text-anchor", "middle");
  //construct Y Axis
  const yAxis = d3.axisLeft(y);
  g.append("g").attr("id", "yAxis").call(yAxis);
  //construct Y Axis Label
  g.append("text").attr("text-anchor", "middle")
    .text("Life Expectancy")
    .attr("x", -chartDim.height / 2)
    .attr("y", -40)
    .attr("transform", "rotate(-90)");

  //set domain for size & colour based on data.
  size.domain([10, d3.max(data[year].countries, d => d.population)]);
  colour.domain(data[year].countries.map(d => d.continent));
  //initialise data viz
  update(data, year);
  //construct legends
  g.append("g")
    .attr("class", "legendQuant")
    .attr("transform", "translate(" + (chartDim.width/4) + ","+(chartDim.height+margin.top+40)+")");

  const legendColour = d3.legendColor()
    .labels(
      d => d.domain[d.i].replace(/\b\w/g, l => l.toUpperCase())
      //["Europe", "Asia & Pacific", "Americas", "Africa"]
    )
    .shape("circle")
    .scale(colour)
    .orient("horizontal")
    .shapePadding(50)
    .labelAlign("middle")
    // .labelOffset(5);

  g.append("g")
    .attr("class", "legendSize");

  g.select(".legendQuant")
    .call(legendColour);
})

//construct tooltips
let tip = d3.tip().attr('class', 'd3-tip').html(
  d => {
    tipText = d.country + "<br>";
    const formatNum = d3.format(",d");
    tipText += "Population: " + formatNum(d.population) + "<br>";
    tipText += "Life Expectancy: " + d.life_exp + "<br>";
    tipText += "GDP Per Capita: " + formatNum(d.income) + "<br>";
    return tipText;
  }
);
g.call(tip)

function update(data, year) {
  // .filter(d => d.population > 0)
  // .filter(d => d.life_exp > 0)
  // .filter(d => d.income > 0)
  //(d,i) => (d,y) => selectContinent.indexOf(d[y].contient) != -1

  //
  //get bubbles group
  let bubble = g.selectAll(".circle")
    .data(data[year].countries
      .filter(
        function(d) {
          return selectContinent.indexOf(d.continent) != -1
        }
      )
      .filter(d => d.population > 0)
      .filter(d => d.life_exp > 0)
      .filter(d => d.income > 0), d => d.country);

  yearLabel.attr("id", "yearLabel").text(data[year].year);

  //remove exit bubbles
  bubble.exit()
  .transition("bubbleExit")
  .duration(250)
  .style("opacity", 0)
  .remove();

  //update existing bubbles
  bubble.transition("bubbleUpdate").duration(500)
    .attr("cx", d => x(d.income))
    .attr("cy", d => y(d.life_exp))
    .attr("r", d => size(d.population))
    .style("fill", d => colour(d.continent));

  //add new bubbles
  bubble.enter().append("circle")
    .attr("r", d => size(d.population))
    .attr("class", "circle")
    .attr("cx", d => x(d.income))
    .attr("cy", d => y(d.life_exp))
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .style("fill", d => colour(d.continent))
    .style("opacity", 0)
    .transition("bubbleNew")
    .duration(500)
    .style("opacity", 0.7)
}
