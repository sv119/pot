var tooltip = d3.select("body")
                .append("div")
                .attr("id", "point-view")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .style("opacity", "0.7")
                .style("border", "solid");


function drawMDS(y, ctx) {

    let data = [];
    if (mdsData[y] == void 0) {
        mdsData[y] = {};
    }
    if (mdsData[y][ctx] == void 0 || mdsData[y][ctx].length != 0) {
        mdsData[y][ctx] = {};
        d3.json("src/mds_" + y + "_" + ctx + ".json", function (jsondata) {
            mdsData[y][ctx] = jsondata;
            var label = mdsData[y][ctx].label;
            data = mdsData[y][ctx].data;
            var type = ctx == "m" ? "Merge" : "Parent";
            for (var i = 0; i < label.length; i++) {
                for (var j = 0; j < dataset[y][type].Balance.length; j++) {
                    if (dataset[y][type].Balance[j].Code == label[i]) {
                        data[i].push(dataset[y][type].Balance[j].Name);
                        data[i].push(label[i]);
                        break;
                    }
                }
            }
            var a = [];
            var b = [];
            for (var i = 0; i < data.length; i++) {
                a.push(data[i][0]);
                b.push(data[i][1]);
            }
            var max1 = d3.max(a);
            var min1 = d3.min(a);
            var max2 = d3.max(b);
            var min2 = d3.min(b);

            var svg = d3.select(".mds")
                .append("svg")
                .attr("width", "530px")
                .attr("height", "360px");

            var linear1 = d3.scale.linear() // 生成线性比例尺
                .domain([min1, max1]) // 设置定义域
                .range([0, 530]);
            var c = [];
            for (var i = 0; i < data.length; i++) {
                c.push(linear1(a[i]));
            }
            var linear1 = d3.scale.linear() // 生成线性比例尺
                .domain([min2, max2]) // 设置定义域
                .range([360, 0]);
            var d = [];
            for (var i = 0; i < data.length; i++) {
                d.push(linear1(b[i]));
            }
            var data1 = [];
            for (var i = 0; i < data.length; i++) {
                data1.push([c[i], d[i], data[i][2], data[i][3]]);
            }
            console.log(data);

            svg.selectAll("circle")
                .data(data1)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return d[0] * 0.8 + 60;
                })
                .attr("cy", function (d) {
                    return d[1] * 0.8 + 10;
                })
                .attr("r", 6)
                .attr("opacity", "0.6")
                .attr("fill", "#3564e6")
                .on("mouseover", function (d) {
                    // alert((parseInt(d3.event.pageX)+10)+'px, ' + (parseInt(d3.event.pageY)-10)+'px');
                    d3.select(this).attr("fill", "white").attr("r", 9).attr("opacity", "0.8");
                    tooltip.html(d[2] + d[3]);
                    tooltip.style("visibility", "visible");
                })
                .on('mousemove', function (d) {

                    tooltip.style('top', (parseInt(d3.event.pageY)-10)+'px').style('left',(parseInt(d3.event.pageX)+10)+'px')
          
                  })
                .on("mouseout", function () {
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr("fill", "#3564e6")
                        .attr("r", 6)
                        .attr("opacity", "0.6");
                     tooltip.style("visibility", "hidden");
                })
                .on("click",function(d){
                    alert(d[3]);
                    $("input[name=Code]").val(d[3]);
                    draw();
                });
        });
        return;
    }
    label = mdsData[y][ctx].label;
    data = mdsData[y][ctx].data;

}
// function drawMDS(y, ctx) {
//     var myChart = echarts.init(document.getElementById('chart2'));
//     let data = [];
//     if (mdsData[y] == void 0) {
//       mdsData[y] = {};
//     }
//     if (mdsData[y][ctx] == void 0 || mdsData[y][ctx].length != 0) {
//       mdsData[y][ctx] = {};
//       d3.json("src/mds_" + y + "_" + ctx + ".json", function (jsondata) {
//         mdsData[y][ctx] = jsondata;
//         var label = mdsData[y][ctx].label;
//         data = mdsData[y][ctx].data;
//         var type = ctx == "m" ? "Merge" : "Parent";
//         for (var i = 0; i < label.length; i++) {
//           for (var j = 0; j < dataset[y][type].Balance.length; j++) {
//             if (dataset[y][type].Balance[j].Code == label[i]) {
//               data[i].push(dataset[y][type].Balance[j].Name);
//               data[i].push(label[i]);
//               break;
//             }
//           }
//         }

//         var option = {
//           textStyle: {
//             color: '#eee'
//           },
//           dataZoom: [{
//               id: 'dataZoomX',
//               type: 'slider',
//               xAxisIndex: [0],
//               filterMode: 'weakFilter'
//             },
//             {
//               id: 'dataZoomY',
//               type: 'slider',
//               yAxisIndex: [0],
//               filterMode: 'weakFilter'
//             }
//           ],
//           color: colorset.sunset,
//           title: {
//             text: "特征值降维",
//             left: 'center',
//             top: 10,
//             textStyle: {
//               color: '#00f6ff'
//             }
//           },
//           xAxis: {},
//           yAxis: {},
//           series: [{
//             symbolSize: 10,
//             symbol: "rect",
//             label: {
//               emphasis: {
//                 show: true,
//                 formatter: function (param) {
//                   return param.data[3]+param.data[2];
//                 },
//                 position: 'top'
//               }
//             },
//             data: data,
//             type: 'scatter'
//           }]
//         };

//         if (option && typeof option === "object") {
//           myChart.setOption(option, true);
//         }
//       });
//       return;
//     }
//     label = mdsData[y][ctx].label;
//     data = mdsData[y][ctx].data;

//     var option = {
//       textStyle: {
//         color: '#eee'
//       },
//       dataZoom: [{
//           id: 'dataZoomX',
//           type: 'slider',
//           xAxisIndex: [0],
//           filterMode: 'weakFilter'
//         },
//         {
//           id: 'dataZoomY',
//           type: 'slider',
//           yAxisIndex: [0],
//           filterMode: 'weakFilter'
//         }
//       ],
//       color: colorset.sunset,
//       title: {
//         text: "特征值降维",
//         left: 'center',
//         top: 10,
//         textStyle: {
//           color: '#e6e6e6'
//         }
//       },
//       xAxis: {},
//       yAxis: {},
//       series: [{
//         symbolSize: 10,
//         symbol: rect,
//         label: {
//           emphasis: {
//             show: true,
//             formatter: function (param) {
//               return param.data[3]+param.data[2];
//             },
//             position: 'top'
//           }
//         },
//         data: data,
//         type: 'scatter'
//       }]
//     };

//     if (option && typeof option === "object") {
//       myChart.setOption(option, true);
//     }
//   }