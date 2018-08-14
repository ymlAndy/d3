class Legends {
    constructor(container, scales) {
        this.scales = scales

        d3.select(container)
            .append("svg")
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("id", "legend")

        this.svg = d3.select("#legend")
        this.drawLegends()
    }

    drawLegends() {
        d3.select(".legendSize").remove()
        d3.select(".legendColour").remove()
        this.svg.append("g")
            .attr("class", "legendSize")
            .attr("transform", "translate(7, 600)");
        this.svg.append("g")
            .attr("class", "legendColour")
            .attr("transform", "translate(7, 750)")

        let legendSize = d3.legendSize()
            .scale(this.scales.size)
            .shape("circle")
            .shapePadding(5)
            .title("# of touch-on")

        let legendColour = d3.legendColor()
            .scale(this.scales.colour)
            .shape("circle")
            .shapePadding(5)
            .title("Stop Type")

        this.svg.select(".legendSize").call(legendSize)
        this.svg.select(".legendColour").call(legendColour)
    }
}