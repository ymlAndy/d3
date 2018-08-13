class Legends {
    constructor(data, dimension, scales, container) {
        this.data = data;
        this.dimension = dimension;
        this.scales = scales;

        d3.select(container)
            .append("svg")
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("id", "legend")

        this.svg = d3.select("#legend")
        this.drawLegend()
    }

    drawLegends() {
        this.svg.append("g")
            .attr("class", "legendSize")
            .attr("transform", "translate(50, 600)");
        this.svg.append("g")
            .attr("class", "legendColour")
            .attr("transform", "translate(50, 750)")

        const legendSize = d3.legendSize()
            .scale(this.scales.size)
            .shape("circle")
            .shapePadding(5)
            .title("# of touch-on")
        // .orient("horizontal")
        const legendColour = d3.legendColor()
            .scale(this.scales.colour)
            .shape("circle")
            // .orient("horizontal")
            .shapePadding(5)
            .title("Stop Type")
        this.svg.select(".legendSize").call(legendSize)
        this.svg.select(".legendColour").call(legendColour)
    }
}