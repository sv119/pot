/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-12 13:50:39 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-13 23:06:32
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
        stroke: "white",
        animation: 1000,
        data: [],
        max: 5
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

    let max = option.max;

    let g = this.SVG.select("g");
    g.selectAll("circle").remove();
    g.selectAll("text").remove();
    g.selectAll("line").remove();

    // collect circles
    let maxLevel = 0;
    let set = [];
    collect("__", option.data);
    let queue = [];
    for (let i = 0; i < maxLevel; i++) {
        queue.push(0);
    }

    // draw circles
    let avrgsize = maxLevel == 1 ? width > height ? height / 16 : width / 16 :
        width > height ? height / 4 / maxLevel : width / 4 / maxLevel;
    drawBranch("__", option.data);

    // adjust circles
    adjustBranch("__", option.data, width / 2, height / 2);

    function collect(path, data) {
        let level = -1;
        for (let i = 0; i < path.length; i++) {
            if (path.substring(i, i + 1) == "_")
                level++;
        }
        if (level > maxLevel) {
            maxLevel = level;
            set.push(0);
        }
        if (data.length > max)
            set[level - 1] += max;
        else
            set[level - 1] += data.length;
        for (let i = 0; i < data.length && i < max; i++) {
            if (data[i].children != void 0 && data[i].children.length != 0)
                collect(path + i + '_', data[i].children);
        }
    }

    function drawBranch(path, data) {
        let level = -1;
        for (let i = 0; i < path.length; i++) {
            if (path.substring(i, i + 1) == "_")
                level++;
        }
        let se = [];
        for (let i = 0; i < max && i < data.length; i++) {
            se.push(data[i]);
        }
        let root = path == "__" ? g : d3.select('#' + path);
        let _x = path == "__" ? width / 2 : parseFloat(root.attr('cx'));
        let _y = path == "__" ? height / 2 : parseFloat(root.attr('cy'));
        let color = option.color;
        let Fcolor = option.fontColor;
        let animation = option.animation / maxLevel;
        let updateLine = g.selectAll(".line" + path).data(se);
        let updateCircle = g.selectAll(".circle" + path).data(se);
        let updateLabel = g.selectAll(".text" + path).data(se);
        let enterLine = updateLine.enter();
        let enterCircle = updateCircle.enter();
        let enterLabel = updateLabel.enter();
        let size = avrgsize / Math.log(level + 2);
        let count = se.length;

        enterLine.append('line')
            .classed('line' + path, true)
            .classed('level-' + level, true)
            .attr("id", function (d, i) {
                return path + i + '_l';
            })
            .attr('x1', _x)
            .attr('x2', _x)
            .attr('y1', _y)
            .attr('y2', _y)
            .transition()
            .duration(function (d, i) {
                return animation / level + i * animation / 4;
            })
            .attr('x2', function (d, i) {
                if (path == "__")
                    return _x;
                return _x + Math.sin(i * 2 * Math.PI / count) * size * 3.2;
            })
            .attr('y2', function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 3.2;
            })
            .style("stroke", option.stroke)
            .style("stroke-width", 1)
            .attr("opacity", 0.5);
        enterCircle.append('circle')
            .classed('circle' + path, true)
            .classed('level-' + level, true)
            .attr("id", function (d, i) {
                return path + i + '_';
            })
            .attr('cx', _x)
            .attr('cy', _y)
            .attr('r', 0)
            .attr("fill", color[level % color.length])
            .attr("opacity", 0)
            .transition()
            .delay(function (d, i) {
                return i * animation / 4 / Math.pow(level, 2);
            })
            .duration(animation / level)
            .attr('r', size)
            .attr('cx', function (d, i) {
                if (path == "__")
                    return _x;
                return _x + Math.sin(i * 2 * Math.PI / count) * size * 3.2;
            })
            .attr('cy', function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 3.2;
            })
            .attr("opacity", 1)
            .each("end", function (d, i) {
                if (d.children == void 0 || d.children.length == 0)
                    return;
                drawBranch(path + i + '_', d.children);
            });
        enterLabel.append('text')
            .classed('text' + path, true)
            .classed('level-' + level, true)
            .attr("id", function (d, i) {
                return path + i + '_t';
            })
            .attr("fill", Fcolor)
            .attr("opacity", 0)
            .attr('cx', _x)
            .attr('cy', _y)
            .text(function (d) {
                return d.label;
            })
            .attr("x", function (d, i) {
                if (path == "__")
                    return _x;
                return _x + Math.sin(i * 2 * Math.PI / count) * size * 3.2;
            })
            .attr("y", function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 3.2;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", 0)
            .transition()
            .delay(function (d, i) {
                return animation * 0.4 / level + i * animation / 4;
            })
            .duration(animation * 0.6 / level)
            .attr("opacity", 1);
    }

    function adjustBranch(path, data, ox, oy) {
        let level = -1;
        for (let i = 0; i < path.length; i++) {
            if (path.substring(i, i + 1) == "_")
                level++;
        }
        let _x = width / 2;
        let _y = height / 2;
        let color = option.color;
        let Fcolor = option.fontColor;
        let animation = option.animation / maxLevel;
        let updateLine = g.selectAll(".line" + path).data(data);
        let updateCircle = g.selectAll(".circle" + path).data(data);
        let updateLabel = g.selectAll(".text" + path).data(data);
        let size = avrgsize / Math.log(level + 2);
        let distance = maxLevel == 1 ? 0 :
            width > height ? height / 2 / (maxLevel - 1) * (level - 1.2) : width / 2 / (maxLevel - 1) * (level - 1.2);

        updateLine.transition()
            .delay(function (d, i) {
                return level < 2 ? animation / Math.pow(level, 2) * (maxLevel + 1.4) + i * animation / Math.pow(level, 2) / 4 :
                    animation / Math.pow(level, 2) * 0.4 + i * animation / Math.pow(level, 2) / 4;
            })
            .duration(animation / level)
            .attr('x1', function () {
                if (level <= 1)
                    return d3.select(this).attr("x1");
                return ox;
            })
            .attr('y1', function () {
                if (level <= 1)
                    return d3.select(this).attr("y1");
                return oy;
            })
            .attr('x2', function () {
                if (level <= 2)
                    return d3.select(this).attr("x2");
                let all = $("line.level-" + level);
                let pos = set[level - 1] <= 8 ? 0 : -1 * parseInt(max / 2);
                for (let t = 0; t < all.length; t++) {
                    if (all[t].id == this.id) {
                        pos += t;
                        break;
                    }
                }
                return _x + Math.sin(pos * 2 * Math.PI / set[level - 1]) * distance;
            })
            .attr('y2', function (d, i) {
                if (level <= 2)
                    return d3.select(this).attr("y2");
                let all = $("line.level-" + level);
                let pos = set[level - 1] <= 8 ? 0 : -1 * parseInt(max / 2);
                for (let t = 0; t < all.length; t++) {
                    if (all[t].id == this.id) {
                        pos += t;
                        break;
                    }
                }
                return _y - Math.cos(pos * 2 * Math.PI / set[level - 1]) * distance;
            })
            .style("stroke", option.stroke)
            .style("stroke-width", 1)
            .attr("opacity", 0.02);
        updateCircle
            .on("mouseover", function () {
                let id = d3.select(this).attr("id");
                d3.select(this)
                    .transition()
                    .duration(animation)
                    .style("opacity", 1);
                let p = id.split("_");
                let s = "#__";
                for (let i = 2; i < p.length; i++) {
                    s += p[i] + "_";
                    d3.select(s)
                        .transition()
                        .duration(animation)
                        .style("opacity", 1);
                    d3.select(s + "t")
                        .transition()
                        .duration(animation)
                        .style("opacity", 1);
                    d3.select(s + "l")
                        .transition()
                        .duration(animation)
                        .style("opacity", 1);
                }
            })
            .on("mouseout", function () {
                let id = d3.select(this).attr("id");
                d3.select(this)
                    .transition()
                    .duration(animation)
                    .style("opacity", 0.7);
                    let p = id.split("_");
                    let s = "#__";
                for (let i = 2; i < p.length; i++) {
                    s += p[i] + "_";
                    d3.select(s)
                        .transition()
                        .duration(animation)
                        .style("opacity", 0.7);
                    d3.select(s + "t")
                        .transition()
                        .duration(animation)
                        .style("opacity", 0.7);
                    d3.select(s + "l")
                        .transition()
                        .duration(animation)
                        .style("opacity", 0.02);
                }
            })
            .transition()
            .delay(function (d, i) {
                return level < 2 ? animation / Math.pow(level, 2) * (maxLevel + 1.4) + i * animation / Math.pow(level, 2) / 4 :
                    animation / Math.pow(level, 2) * 0.4 + i * animation / Math.pow(level, 2) / 4;
            })
            .duration(animation / level)
            .attr('cx', function () {
                if (level <= 2)
                    return d3.select(this).attr("cx");
                let all = $("circle.level-" + level);
                let pos = set[level - 1] <= 8 ? 0 : -1 * parseInt(max / 2);
                for (let t = 0; t < all.length; t++) {
                    if (all[t].id == this.id) {
                        pos += t;
                        break;
                    }
                }
                return _x + Math.sin(pos * 2 * Math.PI / set[level - 1]) * distance;
            })
            .attr('cy', function () {
                if (level <= 2)
                    return d3.select(this).attr("cy");
                let all = $("circle.level-" + level);
                let pos = set[level - 1] <= 8 ? 0 : -1 * parseInt(max / 2);
                for (let t = 0; t < all.length; t++) {
                    if (all[t].id == this.id) {
                        pos += t;
                        break;
                    }
                }
                return _y - Math.cos(pos * 2 * Math.PI / set[level - 1]) * distance;
            })
            .attr('r', size)
            .attr("fill", color[level % color.length])
            .attr("opacity", 0.7)
            .each("end", function (d, i) {
                if (d.children == void 0 || d.children.length == 0)
                    return;
                let all = $("circle.level-" + level);
                let pos = set[level - 1] <= 8 ? 0 : -1 * parseInt(max / 2);
                for (let t = 0; t < all.length; t++) {
                    if (all[t].id == this.id) {
                        pos += t;
                        break;
                    }
                }
                let tx = path == "__" ? _x : _x + Math.sin(pos * 2 * Math.PI / set[level - 1]) * distance;
                let ty = path == "__" ? _y : _y - Math.cos(pos * 2 * Math.PI / set[level - 1]) * distance;
                adjustBranch(path + i + '_', d.children, tx, ty);
            });
        updateLabel.transition()
            .delay(function (d, i) {
                return level < 2 ? animation / Math.pow(level, 2) * (maxLevel + 1.4) + i * animation / Math.pow(level, 2) / 4 :
                    animation / Math.pow(level, 2) * 0.4 + i * animation / Math.pow(level, 2) / 4;
            })
            .duration(animation / level)
            .attr("fill", Fcolor)
            .attr("x", function () {
                if (level <= 2)
                    return d3.select(this).attr("x");
                let all = $("text.level-" + level);
                let pos = set[level - 1] <= 8 ? 0 : -1 * parseInt(max / 2);
                for (let t = 0; t < all.length; t++) {
                    if (all[t].id == this.id) {
                        pos += t;
                        break;
                    }
                }
                return _x + Math.sin(pos * 2 * Math.PI / set[level - 1]) * distance;
            })
            .attr("y", function () {
                if (level <= 2)
                    return d3.select(this).attr("y");
                let all = $("text.level-" + level);
                let pos = set[level - 1] <= 8 ? 0 : -1 * parseInt(max / 2);
                for (let t = 0; t < all.length; t++) {
                    if (all[t].id == this.id) {
                        pos += t;
                        break;
                    }
                }
                return _y - Math.cos(pos * 2 * Math.PI / set[level - 1]) * distance;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", size / 2 * Math.log(level + Math.E))
            .attr("opacity", 0.7);
    }
}