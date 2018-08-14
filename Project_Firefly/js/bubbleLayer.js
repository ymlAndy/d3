class BubbleLayer {
    constructor(data, container, dimension, map, animationDuration) {
        this.data = data;
        this.container = container;
        this.dimension = dimension;
        this.animationDuration = animationDuration
        this.mapLayer = map
        this.chartArea = d3.select(this.container).append("canvas")
            .attr("width", this.dimension.width)
            .attr("height", this.dimension.height)
        this.context = this.chartArea.node().getContext('2d')
        this.detachedContainer = document.createElement("custom")
        this.dataContainer = d3.select(this.detachedContainer)
        this.scales = {
            size: d3.scaleLinear()
                .domain(d3.extent(this.data, d => parseInt(d.card_id)))
                .range([1.5, 10]),
            colour: d3.scaleOrdinal()
                .domain(this.data.map(d => d.StopType))
                .range(["#fc6a52", "#a8d681", "#ffdd1c", "#5e83ba", "#551a8b"])
        }
    }
    drawBubbles(stopType, hour) {
        let bubbles = this.dataContainer.selectAll(".arc")
        let projection = this.mapLayer.getProjection()
        let traffic = this.data

        if (stopType == "All") {
            traffic = traffic.filter(d => parseInt(d.hour) == hour)
            this.scales.size.domain(
                d3.extent(
                    this.data,
                    d => parseInt(d.card_id)
                )
            )
        } else {
            traffic = traffic.filter(d => parseInt(d.hour) == hour).filter(d => d.StopType == stopType)
            this.scales.size.domain(
                d3.extent(this.data.filter(d => d.StopType == stopType), d => parseInt(d.card_id))
            )
        }

        bubbles = bubbles.data(traffic, d => d.stop_ID)
        bubbles.enter()
            .append("custom")
            .attr("class", "arc")
            .attr("x", d => projection([d.GPSLong, d.GPSLat])[0])
            .attr("y", d => projection([d.GPSLong, d.GPSLat])[1])
            .attr("sAngle", 0)
            .attr("eAngle", 2 * Math.PI)
            .attr("fillStyle", 'black')
            .attr("r", 0)
            .attr("fillStyle", d => this.scales.colour(d.StopType))
            .transition("enter")
            .duration(this.animationDuration)
            .attr("r", d => this.scales.size(d.card_id))

        bubbles.attr("x", d => projection([d.GPSLong, d.GPSLat])[0])
            .attr("y", d => projection([d.GPSLong, d.GPSLat])[1])
            .transition("update")
            .duration(this.animationDuration)
            .attr("r", d => this.scales.size(d.card_id))

        bubbles.exit()
            .transition("exit")
            .duration(this.animationDuration)
            .attr("r", 0)
    }

    drawCanvas() {
        let context = this.context
        let elements = d3.select(this.detachedContainer).selectAll("custom.arc");
        context.clearRect(0, 0, this.dimension.width, this.dimension.height);
        context.globalAlpha = 0.85;
        elements.each(function () {
            let node = d3.select(this);

            context.beginPath();
            context.fillStyle = node.attr("fillStyle");
            context.arc(node.attr("x"), node.attr("y"), node.attr("r"), node.attr("sAngle"), node.attr("eAngle"));
            context.fill();
            context.closePath()
        })
    }

    resizeLayer(width, height) {
        this.chartArea.attr("width", width)
            .attr("height", height)
    }
}