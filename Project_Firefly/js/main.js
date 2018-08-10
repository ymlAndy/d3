//GLOBALS/////////////////////////////////////////
const margin = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
}
const chartDimension = {
  height: 800,
  width: 1200
}

const animation_duration = 500

mapboxgl.accessToken = 'pk.eyJ1IjoibHltOTQwMzIwIiwiYSI6ImNqa2tjZDFnODBndzEzcHBqamRpdWk5YXQifQ.11SUGFepK_OOFf40LTYw7w';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/lym940320/cjklw7d3z3bdt2sow3gniizmr',
  center: [145.02642, -37.955],
  zoom: 9
})

map.scrollZoom.disable()
map.addControl(new mapboxgl.NavigationControl())

const container = map.getCanvasContainer()
const chart = d3.select(container)
  .append("canvas")
  .attr("width", chartDimension.width)
  .attr("height", chartDimension.height)
const context = chart.node().getContext("2d");
context.globalAlpha = 0.8
const detachedContainer = document.createElement("custom");
const dataContainer = d3.select(detachedContainer);
let hour = 0

const promises = [
  d3.csv("data/traffic_grouped.csv")
]

Promise.all(promises).then(function (allData) {
  const traffic = allData[0]

  const size = d3.scaleLinear()
  size.domain(d3.extent(traffic, d => d.card_id))
    .range([1.5, 10])

  const colour_categorical = d3.scaleOrdinal()
    .domain(traffic.map(d => d.StopType))
    .range(["#fc6a52", "#a8d681", "#ffdd1c", "#5e83ba", "#551a8b"]);

  d3.timer(drawCanvas)
  let d3Projection = getD3(map);

  constructUI(traffic, size, colour_categorical);
  drawCustom(traffic, 0, size, colour_categorical, "All")

  map.on("move", d => drawCustom(traffic, hour, size, colour_categorical, document.getElementById("dropdown").value))
  map.on("viewreset", d => drawCustom(traffic, hour, size, colour_categorical, document.getElementById("dropdown").value))

}).catch(function (error) {
  console.log(error)
})

function drawCustom(traffic, hour, size, colour, continent) {
  let circles = dataContainer.selectAll(".arc")

  if (continent == "All") {
    circles = circles.data(traffic.filter(d => d.hour == hour), d => d.stop_ID)
  } else {
    circles = circles.data(traffic.filter(d => d.hour == hour).filter(d => d.StopType == continent), d => d.stop_ID)
  }

  d3Projection = getD3(map);

  circles
    .enter()
    .append("custom")
    .attr("class", "arc")
    .attr("x", d => d3Projection([d.GPSLong, d.GPSLat])[0])
    .attr("y", d => d3Projection([d.GPSLong, d.GPSLat])[1])
    .attr("sAngle", 0)
    .attr("eAngle", 2 * Math.PI)
    .attr("fillStyle", 'black')
    .attr("r", 0)
    .attr("fillStyle", d => colour(d.StopType))
    .transition("enter")
    .duration(animation_duration)
    .attr("r", d => size(d.card_id))

  circles
    .attr("x", d => d3Projection([d.GPSLong, d.GPSLat])[0])
    .attr("y", d => d3Projection([d.GPSLong, d.GPSLat])[1])
    .transition("update")
    .duration(animation_duration)
    .attr("r", d => size(d.card_id))

  circles
    .exit()
    .transition("exit")
    .duration(animation_duration)
    .attr("r", 0)
}

function drawCanvas() {
  let elements = dataContainer.selectAll("custom.arc");
  context.clearRect(0, 0, chart.attr("width"), chart.attr("height"));

  elements.each(function () {
    let node = d3.select(this);
    context.beginPath();
    context.fillStyle = node.attr("fillStyle");
    context.arc(node.attr("x"), node.attr("y"), node.attr("r"), node.attr("sAngle"), node.attr("eAngle"));
    context.fill();
    context.closePath();
  });
}

function getD3(map) {
  const center = map.getCenter();
  const zoom = map.getZoom();
  const scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom);

  const d3projection = d3.geoMercator()
    .center([center.lng, center.lat])
    .translate([chartDimension.width / 2, chartDimension.height / 2])
    .scale(scale);
  return d3projection;
}

function constructUI(traffic, size, colour) {
  //set up year slider
  const yearSlider = document.getElementById("yearSlider");
  yearSlider.setAttribute("min", 0);
  yearSlider.setAttribute("max", 23);
  yearSlider.setAttribute("value", 0);
  yearSlider.oninput = function () {
    hour = yearSlider.valueAsNumber;
    drawCustom(traffic, hour, size, colour, document.getElementById("dropdown").value);

  }

  //set up drop down
  const dropdown = document.getElementById("dropdown");
  dropdown.onchange = function () {
    drawCustom(traffic, hour, size, colour, dropdown.value)
  }
}