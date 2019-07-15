/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-12 13:50:39 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-15 19:33:53
 */

console.log("Thanks for using portrait.js, writen by ZhenDong Yang, 2019-7-15");

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
        fill: "circle",
        color: [],
        fontColor: '#FFFFFF',
        linelength: 6,
        stroke: "white",
        animation: 1000,
        data: [],
        minsize: 0.6,
        maxsize: 1,
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
    let maxsize = option.maxsize;
    let minsize = option.minsize;

    let g = this.SVG.select("g");
    g.selectAll("circle").remove();
    g.selectAll("text").remove();
    g.selectAll("line").remove();

    // collect circles
    let maxLevel = 0;
    let set = [];
    let dmax = [];
    let dmin = [];
    collect("__", option.data);

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
        var din = data[0].value == void 0 || !(parseInt(data[0].value) >= 0 || parseInt(data[0].value) < 0) ? 1 : parseFloat(data[0].value);
        if (level > maxLevel) {
            maxLevel = level;
            set.push(0);
            dmax.push(din);
            dmin.push(din);
        }
        if (data.length > max) {
            set[level - 1] += max;
            let mis = data.length;
            while (mis > max) {
                let __min = data[0].value == void 0 ? 1 : data[0].value;
                let index = 0;
                for (let p = 1; p < mis; p++) {
                    if (data[p].value == void 0 || data[p].value < __min) {
                        __min = data[p].value == void 0 ? 1 : data[p].value;
                        index = p;
                    }
                }
                let temp = data[index];
                data[index] = data[--mis];
                data[mis] = temp;
            }
        } else
            set[level - 1] += data.length;
        for (let i = 0; i < data.length && i < max; i++) {
            din = data[i].value == void 0 || !(parseInt(data[i].value) >= 0 || parseInt(data[i].value) < 0) ? 1 : parseFloat(data[i].value);
            if (din > dmax[level - 1])
                dmax[level - 1] = din;
            if (din < dmin[level - 1])
                dmin[level - 1] = din;
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
        let root = null;
        let _x = 0;
        let _y = 0;
        try {
            root = path == "__" ? g : d3.select('#' + path);
            _x = path == "__" ? width / 2 + option.padding[3] : parseFloat(root.attr('cx'));
            _y = path == "__" ? height / 2 + option.padding[0] : parseFloat(root.attr('cy'));
        } catch (error) {
            return;
        }
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
                return animation / level / 2 + i * animation / 8;
            })
            .attr('x2', function (d, i) {
                if (path == "__")
                    return _x;
                return _x + Math.sin(i * 2 * Math.PI / count) * size * 3;
            })
            .attr('y2', function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 3;
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
            .attr("fill", function (d, i) {
                if (option.fill == "circle")
                    return d3.hsl(i * 2 * Math.PI, 0.5, 0.5);
                else
                    return color;
            })
            .attr("opacity", 0)
            .transition()
            .delay(function (d, i) {
                return i * animation / 8 / Math.pow(level, 2);
            })
            .duration(animation / level / 2)
            .attr('r', size)
            .attr('cx', function (d, i) {
                if (path == "__")
                    return _x;
                return _x + Math.sin(i * 2 * Math.PI / count) * size * 3;
            })
            .attr('cy', function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 3;
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
                return _x + Math.sin(i * 2 * Math.PI / count) * size * 3;
            })
            .attr("y", function (d, i) {
                if (path == "__")
                    return _y;
                return _y - Math.cos(i * 2 * Math.PI / count) * size * 3;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", 0)
            .transition()
            .delay(function (d, i) {
                return animation * 0.4 / level / 2 + i * animation / 8;
            })
            .duration(animation * 0.6 / level / 2)
            .attr("opacity", 1);
    }

    function adjustBranch(path, data, ox, oy) {
        let level = -1;
        for (let i = 0; i < path.length; i++) {
            if (path.substring(i, i + 1) == "_")
                level++;
        }
        let _x = width / 2 + option.padding[3];
        let _y = height / 2 + option.padding[0];
        let color = option.color;
        let Fcolor = option.fontColor;
        let animation = option.animation / maxLevel;
        let updateLine = g.selectAll(".line" + path).data(data);
        let updateCircle = g.selectAll(".circle" + path).data(data);
        let updateLabel = g.selectAll(".text" + path).data(data);
        let size = avrgsize / Math.log(level + 2) / maxsize;
        let distance = maxLevel == 1 ? 0 :
            width > height ? height / 2 / (maxLevel - 1) * (level - 1.2) : width / 2 / (maxLevel - 1) * (level - 1.2);

        updateLine.transition()
            .delay(function (d, i) {
                return level < 2 ? animation / Math.pow(level, 2) * (maxLevel + 1.4) / 2 + i * animation / Math.pow(level, 2) / 8 :
                    animation / Math.pow(level, 2) * 0.4 + i * animation / Math.pow(level, 2) / 3;
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
            .attr('y2', function () {
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
            .attr("opacity", 0);
        updateCircle
            .on("mouseover", function () {
                let id = d3.select(this).attr("id");
                d3.select(this).style("opacity", 1);
                let p = id.split("_");
                let s = "#__";
                for (let i = 2; i < p.length; i++) {
                    s += p[i] + "_";
                    d3.select(s).style("opacity", 1);
                    d3.select(s + "t").style("opacity", 1);
                    d3.select(s + "l").style("opacity", 1);
                }
            })
            .on("mouseout", function () {
                let id = d3.select(this).attr("id");
                d3.select(this).style("opacity", 0.7);
                let p = id.split("_");
                let s = "#__";
                for (let i = 2; i < p.length; i++) {
                    s += p[i] + "_";
                    d3.select(s).style("opacity", 0.7);
                    d3.select(s + "t").style("opacity", 0.7);
                    d3.select(s + "l").style("opacity", 0);
                }
            })
            .each(function (d) {
                let act = d.onclick == void 0 ? () => {} : d.onclick;
                d3.select(this).on("click", act);
            })
            .attr("stroke", function (d, i) {
                if (option.fill == "circle")
                    return d3.hsl(i * 2 * Math.PI, 0.5, 0.5);
                else
                    return color;
            })
            .attr("stroke-width", 0)
            .transition()
            .ease("linear-out-in")
            .delay(function (d, i) {
                return level < 2 ? animation / Math.pow(level, 2) * (maxLevel + 1.4) / 2 + i * animation / Math.pow(level, 2) / 8 :
                    animation / Math.pow(level, 2) * 0.4 / 2 + i * animation / Math.pow(level, 2) / 3;
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
            .attr('r', function (d) {
                if (d.value == void 0 || !(parseFloat(d.value) > 0 || parseFloat(d.value) <= 0) || dmin[level - 1] == dmax[level - 1])
                    return size;
                return size * minsize + size * maxsize * (parseFloat(d.value) - dmin[level - 1]) / dmax[level - 1];
            })
            .attr("fill", function () {
                if (option.fill == "circle") {
                    let all = $("circle.level-" + level);
                    let pos = set[level - 1] <= 8 ? 0 : -1 * parseInt(max / 2);
                    for (let t = 0; t < all.length; t++) {
                        if (all[t].id == this.id) {
                            pos += t;
                            break;
                        }
                    }
                    return d3.hsl(360 * pos / set[level - 1], level / maxLevel * 0.6 + 0.4, 0.6 - level / maxLevel * 0.2);
                } else
                    return color;
            })
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
                return level < 2 ? animation / Math.pow(level, 2) * (maxLevel + 1.4) / 2 + i * animation / Math.pow(level, 2) / 8 :
                    animation / Math.pow(level, 2) * 0.4 / 2 + i * animation / Math.pow(level, 2) / 3;
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
            .attr("opacity", 0.7)
            .each("end", function () {
                var text = d3.select(this),
                    words = text.text().split('').reverse(),
                    word, line = [],
                    lineNumber = 0,
                    lineHeight = text.node().getBoundingClientRect().height,
                    x = +text.attr('x'),
                    y = +text.attr('y'),
                    tspan = text.text(null).append('tspan').attr('x', x).attr('y', y);
                while (word = words.pop()) {
                    line.push(word);
                    // const dash = lineNumber > 0 ? '-' : '';
                    // tspan.text(dash + line.join(''));
                    tspan.text(line.join(''));
                    if (tspan.text().length > option.linelength) {
                        line.pop();
                        tspan.text(line.join(''));
                        line = [word];
                        tspan = text.append('tspan').attr('x', x).attr('y', ++lineNumber * lineHeight + y).text(word);
                    }
                }
            });
    }
}