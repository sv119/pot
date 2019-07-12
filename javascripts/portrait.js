/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-12 13:50:39 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-12 15:15:59
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
        border: "1px solid white",
        padding: [0, 0, 0, 0],
        title: "undefined",
        background: "none",
        color: ['#FF7853', '#EA5151', '#CC3F57', '#9A2555', '#FFAE57'],

    };
    this.Data = [];
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
    // load svg
    if (this.SVG == null) {
        var option = this.Option;
        this.SVG = this.Parent
            .append("svg")
            .attr("id", this.ID)
            .attr("width", option.width)
            .attr("height", option.height)
            .style("border", option.border)
            .style("margin", function () {
                console.log(option.margin[0] + " " + option.margin[1] + " " + option.margin[2] + " " + option.margin[3]);
                return option.margin[0] + " " + option.margin[1] + " " + option.margin[2] + " " + option.margin[3];
            })
            .style("padding", function () {
                return option.padding[0] + " " + option.padding[1] + " " + option.padding[2] + " " + option.padding[3];
            })
            .style("background", option.background);
    }
}