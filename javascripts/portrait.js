/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-12 13:50:39 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-12 22:00:38
 */

console.log("Thanks for using portrait.js, writen by ZhenDong Yang, 2019-7-12");

var Portrait = window.NameSpace || {};

Portrait.Chart = function Chart(parent) {
    this.ID = "portraitContainer-" + parseInt(Math.random() * 1000000);
    this.Parent = d3.select("#" + parent);
    this.SVG = null;
    this.Option = {
        width: parseFloat(this.Parent.style("width")) -
            parseFloat(this.Parent.style("padding-left")) - parseFloat(this.Parent.style("padding-right")),
        height: parseFloat(this.Parent.style("height")) -
            parseFloat(this.Parent.style("padding-top")) - parseFloat(this.Parent.style("padding-bottom")),
        margin: [0, 0, 0, 0],
        border: "none",
        padding: [0, 0, 0, 0],
        title: "undefined",
        background: "none",
        color: ['#FF7853', '#EA5151', '#CC3F57', '#9A2555', '#FFAE57'],
        fontColor: '#FFFFFF',
        animation: 400,
        data: [],
        size: 20
    };
};

Portrait.Chart.prototype.clear = function () {
    document.getElementById(this.ID).remove();
    this.SVG = null;
}

Portrait.Chart.prototype.setOption = function (change) {
    for (e in change) {
        if (this.Option[e] == void 0)
            continue;
        if (e == "margin" || e == "padding") {
            if (change[e].length == void 0)
                change[e] = [parseFloat(change[e]), parseFloat(change[e]), parseFloat(change[e]), parseFloat(change[e])];
            else if (change[e].length == 1)
                change[e] = [parseFloat(change[e][0]), parseFloat(change[e][0]), parseFloat(change[e][0]), parseFloat(change[e][0])];
            else if (change[e].length == 2)
                change[e] = [parseFloat(change[e][0]), parseFloat(change[e][1]), parseFloat(change[e][0]), parseFloat(change[e][1])];
            else if (change[e].length == 3)
                change[e] = [parseFloat(change[e][0]), parseFloat(change[e][1]), parseFloat(change[e][2]), parseFloat(change[e][1])];
            else
                change[e] = [parseFloat(change[e][0]), parseFloat(change[e][1]), parseFloat(change[e][2]), parseFloat(change[e][3])];
        } else if (e == "color") {
            if (change[e].length == void 0)
                change[e] = [change[e]];
        }
        this.Option[e] = change[e];
    }
    var option = this.Option;
    // load svg
    if (this.SVG == null) {
        this.SVG = this.Parent
            .append("svg")
            .attr("id", this.ID)
            .attr("width", function () {
                if (option.border == "none")
                    return option.width - option.margin[1] - option.margin[3];
                return option.width - option.margin[1] - option.margin[3] - 2 * parseFloat(option.border);
            })
            .attr("height", function () {
                if (option.border == "none")
                    return option.height - option.margin[0] - option.margin[2];
                return option.height - option.margin[0] - option.margin[2] - 2 * parseFloat(option.border);
            })
            .style("border", option.border)
            .style("margin", function () {
                return option.margin[0] + "px " + option.margin[1] + "px " + option.margin[2] + "px " + option.margin[3] + "px";
            })
            .style("padding", function () {
                return option.padding[0] + "px " + option.padding[1] + "px " + option.padding[2] + "px " + option.padding[3] + "px";
            })
            .style("background", option.background);
        this.SVG.append("g");
    }
    let width = option.width - option.margin[1] - option.margin[3] - 2 * parseFloat(option.border) - option.padding[1] - option.padding[3];
    let height = option.height - option.margin[0] - option.margin[2] - 2 * parseFloat(option.border) - option.padding[0] - option.padding[2];
    if (option.border == "none") {
        width = option.width - option.margin[1] - option.margin[3] - option.padding[1] - option.padding[3];
        height = option.height - option.margin[0] - option.margin[2] - option.padding[0] - option.padding[2];
    }
    let g = this.SVG.select("g");
    g.selectAll("circle").remove();
    g.selectAll("text").remove();
    g.selectAll("line").remove();

    // draw circles
    drawBranch("__", option.data, 1);

    function drawBranch(path, data, _lastcount) {
        let level = -1;
        for (let i = 0; i < path.length; i++) {
            if (path.substring(i, i + 1) == "_")
                level++;
        }
        let root = path == "__" ? g : d3.select('#' + path);
        let _x = path == "__" ? width / 2 : parseFloat(root.attr('cx'));
        let _y = path == "__" ? height / 2 : parseFloat(root.attr('cy'));
        let color = option.color;
        let Fcolor = option.fontColor;
        let animation = option.animation;
        let updateLine = g.selectAll(".line" + path).data(data);
        let updateCircle = g.selectAll(".circle" + path).data(data);
        let updateLabel = g.selectAll(".text" + path).data(data);
        let enterLine = updateLine.enter();
        let enterCircle = updateCircle.enter();
        let enterLabel = updateLabel.enter();
        let exitLine = updateLine.exit();
        let exitCircle = updateCircle.exit();
        let exitLabel = updateLabel.exit();
        let size = option.size / Math.log(level + 1);
        let count = data.length;

        updateLine.attr('x1', _x)
            .attr('x2', _x)
            .attr('y1', _y)
            .attr('y2', _y)
            .transition()
            .duration(animation)
            .attr('x2', function (d, i) {
                if (path == "__")
                    return _x;
                return _x - Math.sin(i * 2 * Math.PI / count) * size * 4;
            })
            .attr('y2', function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 4;
            })
            .style("stroke", color[(level - 1) % color.length])
            .style("stroke-width", 1)
            .attr("opacity", 1);
        updateCircle.attr('cx', _x)
            .attr('cy', _y)
            .transition()
            .duration(animation)
            .attr('cx', function (d, i) {
                if (path == "__")
                    return _x;
                return _x - Math.sin(i * 2 * Math.PI / count) * size * 4;
            })
            .attr('cy', function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 4;
            })
            .attr('r', size)
            .attr("fill", color[level % color.count])
            .attr("opacity", 1)
            .each("end", function (d, i) {
                if (d.children == void 0 || d.children.length == 0)
                    return;
                drawBranch(path + i + '_', d.children, count);
            });
        updateLabel.attr('cx', _x)
            .attr('cy', _y)
            .html(function (d, i) {
                if (path == "__")
                    return "<tspan style='position: relative;'>" + d.label + "</tspan>" +
                        "<tspan x='" + (_x) + "' y='" + (_y + size / 2) + "'>" + d.value + "</tspan>";
                return "<tspan style='position: relative;'>" + d.label + "</tspan>" +
                    "<tspan x='" + (_x - Math.sin(i * 2 * Math.PI / count) * size * 4) +
                    "' y='" + (_y - Math.cos(i * 2 * Math.PI / count) * size * 4 + size / 2) + "'>" + d.value + "</tspan>";
            })
            .transition()
            .duration(animation)
            .attr("fill", Fcolor)
            .attr("x", function (d, i) {
                if (path == "__")
                    return _x;
                return _x - Math.sin(i * 2 * Math.PI / count) * size * 4;
            })
            .attr("y", function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 4;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", size / 3)
            .attr("opacity", 1);

        enterLine.append('line')
            .classed('line' + path, true)
            .attr('x1', _x)
            .attr('x2', _x)
            .attr('y1', _y)
            .attr('y2', _y)
            .transition()
            .duration(animation)
            .attr('x2', function (d, i) {
                if (path == "__")
                    return _x;
                return _x - Math.sin(i * 2 * Math.PI / count) * size * 4;
            })
            .attr('y2', function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 4;
            })
            .style("stroke", color[(level - 1) % color.length])
            .style("stroke-width", 1)
            .attr("opacity", 1);
        enterCircle.append('circle')
            .classed('circle' + path, true)
            .attr("id", function (d, i) {
                return path + i + '_';
            })
            .attr('cx', _x)
            .attr('cy', _y)
            .attr('r', 0)
            .attr("fill", color[level % color.length])
            .attr("opacity", 0)
            .transition()
            .duration(animation)
            .attr('r', size)
            .attr('cx', function (d, i) {
                if (path == "__")
                    return _x;
                return _x - Math.sin(i * 2 * Math.PI / count) * size * 4;
            })
            .attr('cy', function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 4;
            })
            .attr("opacity", 1)
            .each("end", function (d, i) {
                if (d.children == void 0 || d.children.length == 0)
                    return;
                drawBranch(path + i + '_', d.children, count);
            });
        enterLabel.append('text')
            .classed('text' + path, true)
            .attr("fill", Fcolor)
            .attr("opacity", 0)
            .attr('cx', _x)
            .attr('cy', _y)
            .html(function (d, i) {
                if (path == "__")
                    return "<tspan style='position: relative;'>" + d.label + "</tspan>" +
                        "<tspan x='" + (_x) + "' y='" + (_y + size / 2) + "'>" + d.value + "</tspan>";
                return "<tspan style='position: relative;'>" + d.label + "</tspan>" +
                    "<tspan x='" + (_x - Math.sin(i * 2 * Math.PI / count) * size * 4) +
                    "' y='" + (_y - Math.cos(i * 2 * Math.PI / count) * size * 4 + size / 2) + "'>" + d.value + "</tspan>";
            })
            .attr("x", function (d, i) {
                if (path == "__")
                    return _x;
                return _x - Math.sin(i * 2 * Math.PI / count) * size * 4;
            })
            .attr("y", function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 4;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", size / 3)
            .transition()
            .delay(animation * 0.4)
            .duration(animation * 0.6)
            .attr("opacity", 1);

        exitLine.transition()
            .duration(animation)
            .attr("opacity", 0)
            .each("end", function () {
                d3.select(this).remove();
            });
        exitCircle.transition()
            .duration(animation)
            .attr("r", 0)
            .attr("opacity", 0)
            .each("end", function () {
                if (d.children != void 0 && d.children.length != 0)
                    drawBranch(path + i + '_', d.children, count);
                d3.select(this).remove();
            });
        exitLabel.transition()
            .duration(animation)
            .attr("opacity", 0)
            .each("end", function () {
                d3.select(this).remove();
            });
    }
}