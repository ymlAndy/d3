const promises = [d3.csv("data/traffic_grouped.csv")]
Promise.all(promises).then(allData => {
  //LOAD DATA
  const traffic = allData[0]

  //SET UP VIZ CONFIGURATIONS
  const dimension = {
    height: document.getElementById("map").clientHeight,
    width: document.getElementById("map").clientWidth
  }
  const animationDuration = 800

  //SET UP CONTROL VARIABLES
  let hour = 0

  //INITIALISE MAP LAYER
  const mapconfig = {
    container: 'map',
    token: 'pk.eyJ1IjoibHltOTQwMzIwIiwiYSI6ImNqa2tjZDFnODBndzEzcHBqamRpdWk5YXQifQ.11SUGFepK_OOFf40LTYw7w',
    style: 'mapbox://styles/lym940320/cjklw7d3z3bdt2sow3gniizmr',
    dimension: dimension,
    center: [145.02642, -37.955],
    zoom: 9
  }
  const mapbox = new MapBox(mapconfig, dimension)
  const map = mapbox.map
  map.scrollZoom.disable()
  map.touchZoomRotate.disable();
  map.dragRotate.disable();
  map.addControl(new mapboxgl.NavigationControl({
    showCompass: false
  }))

  const container = map.getCanvasContainer()

  //FADE IN MAP WHEN LOADED
  map.on("load", () => {
    document.getElementById('loader').style.display = 'none'
    document.getElementById('container').style.transition = '2000ms'
    document.getElementById('container').style.opacity = 1
  })

  //INITIALISE DATA LAYER
  const bubbleLayer = new BubbleLayer(traffic, container, dimension, mapbox, animationDuration)
  d3.timer(() => bubbleLayer.drawCanvas())
  bubbleLayer.drawBubbles(document.getElementById("dropdown").value, hour)

  //DRAW LEGEND & LABEL
  let legend = new Legends(container, bubbleLayer.scales)
  legend.drawHourLabel(0)

  //SYNC DATA LAYER WITH MAP LAYER AND MAKE RESPONSIVE
  map.on("move", () => bubbleLayer.drawBubbles(document.getElementById("dropdown").value, hour))
  map.on("viewreset", () => bubbleLayer.drawBubbles(document.getElementById("dropdown").value, hour))
  window.onresize = () => {
    let mapDiv = document.getElementById("map")
    bubbleLayer.resizeLayer(mapDiv.clientWidth, mapDiv.clientHeight)
    bubbleLayer.drawBubbles(dropdown.value, hour)
  }

  //CREATE UI HANDLERS
  const dropdown = document.getElementById("dropdown");
  dropdown.onchange = () => {
    bubbleLayer.drawBubbles(dropdown.value, hour, legend)
  }

  const yearSlider = document.getElementById("yearSlider");
  yearSlider.setAttribute("min", -1);
  yearSlider.setAttribute("max", 23);
  yearSlider.setAttribute("value", 0);
  yearSlider.oninput = () => {
    hour = yearSlider.valueAsNumber;
    bubbleLayer.drawBubbles(dropdown.value, hour);
    legend.drawHourLabel(hour)
  }
}).catch(error => {
  console.log(error)
})