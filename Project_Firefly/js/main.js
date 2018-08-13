const promises = [d3.csv("data/traffic_grouped.csv")]
Promise.all(promises).then(function (allData) {
  const dimension = {
    height: document.getElementById("map").clientHeight,
    width: document.getElementById("map").clientWidth
  }

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
  map.on("load", d => {
    document.getElementById('loader').style.display = 'none'
    document.getElementById('container').style.transition = '2000ms'
    document.getElementById('container').style.opacity = 1
  })
  map.scrollZoom.disable()
  map.touchZoomRotate.disable();
  map.dragRotate.disable();
  map.addControl(new mapboxgl.NavigationControl({
    showCompass: false
  }))

  const container = map.getCanvasContainer()

  let hour = 0
  const animationDuration = 800
  const traffic = allData[0]
  const bubbleLayer = new BubbleLayer(traffic, container, dimension, mapbox)
  d3.timer(d => bubbleLayer.drawCanvas())
  bubbleLayer.drawBubbles("All", hour, animationDuration)

  let legend = new Legends(traffic, dimension, bubbleLayer.scales, container)
  legend.drawLegends()

  map.on("move", d => bubbleLayer.drawBubbles(document.getElementById("dropdown").value, hour, animationDuration))
  map.on("viewreset", d => bubbleLayer.drawBubbles(document.getElementById("dropdown").value, hour, animationDuration))
  window.onresize = function () {
    let mapDiv = document.getElementById("map")
    dimension.height = mapDiv.clientHeight
    dimension.width = mapDiv.clientWidth
    bubbleLayer.resizeLayer(dimension.width, dimension.height)
    bubbleLayer.drawBubbles(dropdown.value, hour, animationDuration)
  }

  const dropdown = document.getElementById("dropdown");
  dropdown.onchange = function () {
    bubbleLayer.drawBubbles(dropdown.value, hour, animationDuration)
  }

  const yearSlider = document.getElementById("yearSlider");
  yearSlider.setAttribute("min", -1);
  yearSlider.setAttribute("max", 23);
  yearSlider.setAttribute("value", 0);
  yearSlider.oninput = function () {
    hour = yearSlider.valueAsNumber;
    bubbleLayer.drawBubbles(dropdown.value, hour, animationDuration)
  }
}).catch(function (error) {
  console.log(error)
})