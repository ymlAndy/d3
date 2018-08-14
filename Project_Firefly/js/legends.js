class Legends {
    constructor(data, dimension, container) {
        this.data = data;
        this.dimension = dimension;

        d3.select(container)
            .append("svg")
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("id", "legend")

        this.svg = d3.select("#legend")
    }

    drawLegends(scales) {
        this.svg.append("g")
            .attr("class", "legendSize")
            .attr("transform", "translate(7, 600)");
        this.svg.append("g")
            .attr("class", "legendColour")
            .attr("transform", "translate(7, 750)")

        let legendSize = d3.legendSize()
            .scale(scales.size)
            .shape("circle")
            .shapePadding(5)
            .title("# of touch-on")
        // .orient("horizontal")
        let legendColour = d3.legendColor()
            .scale(scales.colour)
            .shape("circle")
            // .orient("horizontal")
            .shapePadding(5)
            .title("Stop Type")

        if (scales) {
            legendSize.scale(scales.size)
        }
        this.svg.select(".legendSize").call(legendSize)
        this.svg.select(".legendColour").call(legendColour)
    }
}