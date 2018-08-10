class MapBox {
    constructor(mapconfig, dimension) {
        mapboxgl.accessToken = mapconfig.token

        this.map = new mapboxgl.Map({
            container: mapconfig.container,
            style: mapconfig.style,
            center: mapconfig.center,
            zoom: mapconfig.zoom
        })

        this.properties = {
            center: mapconfig.center,
            zoom: mapconfig.zoom,
            scale: (512) * 0.5 / Math.PI * Math.pow(2, mapconfig.zoom),
            height: dimension.height,
            width: dimension.width
        }
    }
    getProjection() {
        const center = this.map.getCenter()
        const zoom = this.map.getZoom();
        const scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom);
        const projection = d3.geoMercator()
            .center([center.lng, center.lat])
            .translate([document.getElementById("map").clientWidth / 2, document.getElementById("map").clientHeight / 2])
            .scale(scale);
        return projection
    }
}