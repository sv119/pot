/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-04 10:56:05 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-11 14:56:39
 */

var colorset = {
  sunset: ['#FF7853', '#EA5151', '#CC3F57', '#9A2555', '#FFAE57'],
  background: '#2E2733'
};

var dataset = {};

var Sheets = {
  BalanceSheet: [],
  IncomeStatement: [],
  CashFlowStatement: []
};

var SRC = {
  BalanceSheet: "src/BalanceSheet.csv",
  IncomeStatement: "src/IncomeStatement.csv",
  CashFlowStatement: "src/CashFlowStatement.csv",
  Rule: "src/rule.csv",
  Dictionary: "src/Dictionary.csv"
};

var yearset = [];

var incase = {
  year: null,
  ctx: "Merge"
};

(function load() {
  var csv = d3.dsv(",", "text/csv;charset=gb2312");
  csv(SRC.Rule, function (data) {
    LoadClassInfo(data);
    csv(SRC.Dictionary, function (data) {
      LoadDictionary(data);
      csv(SRC.BalanceSheet, function (data) {
        Sheets.BalanceSheet = data;
        for (let i = 0; i < data.length; i++) {
          let year = (data[i].DATA_YEAR).toString().substring(0, 4);
          for (var y = 0; y <= yearset.length; y++) {
            if (y == yearset.length) {
              yearset.push(year);
              d3.select("#year")
                .append("li")
                .append("a")
                .attr("href", "javascript: void(0);")
                .text(year)
                .on("click", function () {
                  if (d3.select(this).text() == incase.year)
                    return;
                  incase.year = d3.select(this).text();
                  d3.select("#nowYear").html(incase.year + '<span class="caret"></span>');
                  draw();
                });
              if (y == 0) {
                d3.select("#nowYear").html(year + '<span class="caret"></span>');
                incase.year = year;
              }
              break;
            }
            if (year == yearset[y])
              break;
          }
          let ctx = "undefined";
          if (data[i].CONTEXTREF == "合并年初至报告期末" || data[i].CONTEXTREF == "合并上年年初至报告期末")
            ctx = "Merge";
          else if (data[i].CONTEXTREF == "母公司年初至报告期末" || data[i].CONTEXTREF == "母公司上年年初至报告期末")
            ctx = "Parent";
          if (dataset[year] == void 0)
            dataset[year] = {};
          if (dataset[year][ctx] == void 0) {
            dataset[year][ctx] = {
              Balance: [],
              Income: [],
              CashFlow: []
            };
          }
          for (let e = 0; e <= dataset[year][ctx].Balance.length; e++) {
            if (e == dataset[year][ctx].Balance.length) {
              dataset[year][ctx].Balance.push(new Balance(data[i]));
              break;
            }
            if (dataset[year][ctx].Balance[e].Code == data[i].SECURITY_CODE) {
              break;
            }
          }
        }
        csv(SRC.IncomeStatement, function (data) {
          Sheets.IncomeStatement = data;
          for (let i = 0; i < data.length; i++) {
            let year = (data[i].DATA_YEAR).toString().substring(0, 4);
            let ctx = "undefined";
            if (data[i].CONTEXTREF == "合并年初至报告期末" || data[i].CONTEXTREF == "合并上年年初至报告期末")
              ctx = "Merge";
            else if (data[i].CONTEXTREF == "母公司年初至报告期末" || data[i].CONTEXTREF == "母公司上年年初至报告期末")
              ctx = "Parent";
            if (dataset[year] == void 0)
              dataset[year] = {};
            if (dataset[year][ctx] == void 0) {
              dataset[year][ctx] = {
                Balance: [],
                Income: [],
                CashFlow: []
              };
            }
            for (let e = 0; e <= dataset[year][ctx].Income.length; e++) {
              if (e == dataset[year][ctx].Income.length) {
                dataset[year][ctx].Income.push(new Income(data[i]));
                break;
              }
              if (dataset[year][ctx].Income[e].Code == data[i].SECURITY_CODE) {
                break;
              }
            }
          }
          csv(SRC.CashFlowStatement, function (data) {
            Sheets.CashFlowStatement = data;
            for (let i = 0; i < data.length; i++) {
              let year = (data[i].DATA_YEAR).toString().substring(0, 4);
              let ctx = "undefined";
              if (data[i].CONTEXTREF == "合并年初至报告期末" || data[i].CONTEXTREF == "合并上年年初至报告期末")
                ctx = "Merge";
              else if (data[i].CONTEXTREF == "母公司年初至报告期末" || data[i].CONTEXTREF == "母公司上年年初至报告期末")
                ctx = "Parent";
              if (dataset[year] == void 0)
                dataset[year] = {};
              if (dataset[year][ctx] == void 0) {
                dataset[year][ctx] = {
                  Balance: [],
                  Income: [],
                  CashFlow: []
                };
              }
              for (let e = 0; e <= dataset[year][ctx].CashFlow.length; e++) {
                if (e == dataset[year][ctx].CashFlow.length) {
                  dataset[year][ctx].CashFlow.push(new CashFlow(data[i]));
                  break;
                }
                if (dataset[year][ctx].CashFlow[e].Code == data[i].SECURITY_CODE) {
                  break;
                }
              }
            }
            init();
          })
        })
      });
    });
  });
})()

function init() {
  // console.log(dataset);
  layout();
  d3.selectAll(".ctxselector").on("click", function () {
    if (d3.select(this).text() == incase.ctx)
      return;
    incase.ctx = d3.select(this).text() == "合并年数据" ? "Merge" : "Parent";
    d3.select("#nowCtx").html(d3.select(this).text() + '<span class="caret"></span>');
    draw();
  });
  $("input[name=Code]").val("");
  document.getElementById("inputCode").focus();
  paint_sunburst([]);
  buildTree();
  if (incase.ctx == "Merge") {
    drawMDS(incase.year, "m");
  } else {
    drawMDS(incase.year, "p");
  }
}

function draw() {
  layout();
  if (incase.ctx == "Merge") {
    drawMDS(incase.year, "m");
  } else {
    drawMDS(incase.year, "p");
  }
  let code = $("input[name=Code]").val();
  d3.select("#notexist")
    .text("证券信息不存在")
    .style("visibility", "hidden");
  if (parseInt(code) < 100000) {
    return;
  }
  if (parseInt(code) < 430000 || parseInt(code) >= 880000) {
    d3.select("#notexist")
      .text("数值超限")
      .style("visibility", "visible");
    return;
  }
  d3.select("#notexist")
    .style("visibility", "visible");
  let objset = [];
  let prtset = [];
  for (let y = 0; y < yearset.length; y++) {
    for (let i = 0; i < dataset[yearset[y]]["Merge"]["Balance"].length; i++) {
      if (dataset[yearset[y]]["Merge"]["Balance"][i].Code == code) {
        d3.select("#notexist")
          .style("visibility", "hidden");
        objset.push(dataset[yearset[y]]["Merge"]["Balance"][i]);
        objset[objset.length - 1].year = yearset[y];
        break;
      }
    }
  }
  for (let y = 0; y < yearset.length; y++) {
    for (let i = 0; i < dataset[yearset[y]]["Parent"]["Balance"].length; i++) {
      if (dataset[yearset[y]]["Parent"]["Balance"][i].Code == code) {
        d3.select("#notexist")
          .style("visibility", "hidden");
        prtset.push(dataset[yearset[y]]["Parent"]["Balance"][i]);
        prtset[prtset.length - 1].year = yearset[y];
        break;
      }
    }
  }
  // paint_detail(objset, prtset);
  if (incase.ctx == "Merge") {
    paint_analyze(objset);
  } else {
    paint_analyze(prtset);
  }

  if (objset.length == 0 && prtset.length == 0) {
    paint_sunburst([]);
    return;
  }

  var year = incase.year;
  var type = incase.ctx;
  for (let i = 0; i < Sheets.BalanceSheet.length; i++) {
    if ((Sheets.BalanceSheet[i].DATA_YEAR).toString().substring(0, 4) != year)
      continue;
    if (type == "Parent" &&
      (Sheets.BalanceSheet[i].CONTEXTREF == "合并年初至报告期末" || Sheets.BalanceSheet[i].CONTEXTREF == "合并上年年初至报告期末") ||
      type == "Merge" &&
      (Sheets.BalanceSheet[i].CONTEXTREF == "母公司年初至报告期末" || Sheets.BalanceSheet[i].CONTEXTREF == "母公司上年年初至报告期末"))
      continue;
    if (Sheets.BalanceSheet[i].SECURITY_CODE == code) {
      paint_sunburst(Sheets.BalanceSheet[i]);
      break;
    }
  }
}

function paint_sunburst(d) {
  if (d == void 0)
    d = [];
  var colors = colorset.sunset;
  var bgColor = colorset.background;

  var myChart = echarts.init(document.getElementById('sunburst'));
  if (d.length == 0) {
    var data = [{
      name: '',
      value: 1,
      itemStyle: {
        normal: {
          color: colors[0]
        }
      }
    }];

    option = {
      backgroundColor: bgColor,
      color: colors,
      title: {
        text: "没有数据",
        left: 'center',
        top: 10,
        textStyle: {
          color: '#e6e6e6',
          opacity: 1
        }
      },
      highlightPolicy: 'descendant',
      emphasis: {
        itemStyle: {
          opacity: 1
        }
      },
      highlight: {
        itemStyle: {
          opacity: 0.9
        }
      },
      series: [{
        type: 'sunburst',
        center: ['50%', '52%'],
        data: data,
        label: {
          rotate: 'radial',
          color: '#222',
          minAngle: 5
        },
        itemStyle: {
          borderColor: bgColor,
          borderWidth: 2,
          opacity: 0.65
        },
        levels: [{}, {
          r0: 20,
          r: 75,
          label: {
            rotate: 0
          },
          downplay: {
            label: {
              opacity: 0.5
            }
          }
        }]
      }]
    };

    if (option && typeof option === "object") {
      myChart.setOption(option, true);
    }
    return;
  }

  var data = [{
    name: '资产总计',
    itemStyle: {
      normal: {
        color: colors[0]
      }
    },
    children: [{
      name: '流动资产',
      label: {
        color: colors[0]
      },
      itemStyle: {
        color: 'transparent',
        borderColor: colors[0]
      },
      children: []
    }, {
      name: '非流动资产',
      label: {
        color: colors[0]
      },
      itemStyle: {
        color: 'transparent',
        borderColor: colors[0]
      },
      children: []
    }]
  }, {
    name: '负债总计',
    itemStyle: {
      color: colors[1]
    },
    children: [{
      name: '流动负债',
      label: {
        color: colors[1]
      },
      itemStyle: {
        color: 'transparent',
        borderColor: colors[1]
      },
      children: []
    }, {
      name: '非流动负债',
      label: {
        color: colors[1]
      },
      itemStyle: {
        color: 'transparent',
        borderColor: colors[1]
      },
      children: []
    }]
  }, {
    name: '所有者权益',
    itemStyle: {
      color: colors[2]
    },
    children: [{
      name: '所有者权益总计',
      label: {
        color: colors[2]
      },
      itemStyle: {
        color: 'transparent',
        borderColor: colors[2]
      },
      children: []
    }]
  }];

  // 流动资产
  var all = parseInt(d["BAME00030M"]);
  var others = 0;
  var para = "BAME00";
  for (var num = 3; num <= 83; num++) {
    var spaner = num < 10 ? "0" + num : num;
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 6) {
      var child = {
        name: nameof[para + spaner + "0M"],
        value: val
      };
      data[0]['children'][0]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }
  var child = {
    name: "其他",
    value: others
  };
  data[0]['children'][0]['children'].push(child);

  // 非流动资产
  all = parseInt(d["BAME01320M"]);
  others = 0;
  para = "BAME0";
  for (var num = 86; num <= 131; num++) {
    var spaner = num < 100 ? "0" + num : num;
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 6) {
      var child = {
        name: nameof[para + spaner + "0M"],
        value: val
      };
      data[0]['children'][1]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }
  child = {
    name: "其他",
    value: others
  };
  data[0]['children'][1]['children'].push(child);

  // 流动负债
  all = parseInt(d["BAME01980M"]);
  others = 0;
  para = "BAME0";
  for (var num = 137; num <= 197; num++) {
    var spaner = num.toString();
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 6) {
      var child = {
        name: nameof[para + spaner + "0M"],
        value: val
      };
      data[1]['children'][0]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }
  child = {
    name: "其他",
    value: others
  };
  data[1]['children'][0]['children'].push(child);

  // 非流动负债
  all = parseInt(d["BAME02190M"]);
  others = 0;
  para = "BAME0";
  for (var num = 200; num <= 218; num++) {
    var spaner = num.toString();
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 6) {
      var child = {
        name: nameof[para + spaner + "0M"],
        value: val
      };
      data[1]['children'][1]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }
  child = {
    name: "其他",
    value: others
  };
  data[1]['children'][1]['children'].push(child);

  // 所有者权益总计
  all = parseInt(d["BAME02470M"]);
  others = 0;
  para = "BAME0";
  for (var num = 223; num <= 246; num++) {
    var spaner = num.toString();
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 6) {
      var child = {
        name: nameof[para + spaner + "0M"],
        value: val
      };
      data[2]['children'][0]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }
  child = {
    name: "其他",
    value: others
  };
  data[2]['children'][0]['children'].push(child);

  option = {
    backgroundColor: bgColor,
    color: colors,
    title: {
      text: d.SECURITY_NAME,
      subtext: dict[d.SECURITY_CODE].TYPE_1 + "/" + dict[d.SECURITY_CODE].TYPE_2 + "/" + dict[d.SECURITY_CODE].TYPE_3,
      left: 'center',
      top: 10,
      textStyle: {
        color: '#e6e6e6',
        opacity: 1
      }
    },
    highlightPolicy: 'descendant',
    emphasis: {
      itemStyle: {
        opacity: 1
      }
    },
    highlight: {
      itemStyle: {
        opacity: 0.9
      }
    },
    series: [{
      type: 'sunburst',
      center: ['50%', '52%'],
      data: data,
      sort: function (a, b) {
        if (a.depth === 1) {
          return b.getValue() - a.getValue();
        } else {
          return a.dataIndex - b.dataIndex;
        }
      },
      label: {
        rotate: 'radial',
        color: '#222',
        minAngle: 5
      },
      // itemStyle: {
      //   borderColor: bgColor,
      //   borderWidth: 2,
      //   opacity: 0.65
      // },
      levels: [{}, {
        r0: 30,
        r: 65,
        label: {
          rotate: 0
        },
        downplay: {
          label: {
            opacity: 0.5
          }
        }
      }, {
        r0: 65,
        r: 105,
        label: {
          rotate: 'tangential',
          fontSize: 10,
        },
        downplay: {
          label: {
            opacity: 0.5
          }
        }
      }, {
        r0: 105,
        r: 125,
        itemStyle: {
          shadowBlur: 80,
          shadowColor: colors[0]
        },
        label: {
          position: 'outside',
          textShadowBlur: 5,
          textShadowColor: '#333',
          color: '#eee'
        },
        downplay: {
          label: {
            opacity: 0.5
          }
        }
      }]
    }]
  };

  if (option && typeof option === "object") {
    myChart.setOption(option, true);
  }
}

function buildTree() {
  var all = d3.select("#tree")
    .append("div")
    .attr("id", "treeContainer")
    .style("margin", "10px")
    .style("letter-spacing", "0.2em");
  for (let i_1 = 0; i_1 < Class.length; i_1++) {
    if (Class[i_1].name == "")
      continue;
    var c_1 = all.append("p")
      .append("a")
      .attr("href", "javascript: void(0);")
      .attr("id", "root_" + i_1)
      .style("line-height", "1.8em")
      .style("color", colorset.sunset[0])
      .html(Class[i_1].name)
      .on("click", function () {
        var child = "branch_at_" + this.id.substring(5, this.id.length);
        d3.selectAll(".level2")
          .style("display", function () {
            if (d3.select(this).classed(child)) {
              return d3.select(this).style("display") == "block" ? "none" : "block";
            } else {
              return "none";
            }
          });
        d3.selectAll(".level3")
          .style("display", "none");
        d3.selectAll(".level4").style("display", "none");
      });
    for (let i_2 = 0; i_2 < Class[i_1].children.length; i_2++) {
      var c_2 = all.append("p")
        .append("a")
        .attr("href", "javascript: void(0);")
        .classed("level2", true)
        .classed("branch_at_" + i_1, true)
        .attr("id", "root_" + i_1 + "_" + i_2)
        .style("line-height", "1.4em")
        .style("display", "none")
        .style("color", colorset.sunset[1])
        .html("&nbsp;&nbsp;" + Class[i_1].children[i_2].name)
        .on("click", function () {
          var child = "branch_at_" + this.id.substring(5, this.id.length);
          d3.selectAll(".branch_" + this.id.substring(5, this.id.length))
            .style("display", "none");
          d3.selectAll(".level3")
            .style("display", function () {
              if (d3.select(this).classed(child)) {
                return d3.select(this).style("display") == "block" ? "none" : "block";
              } else {
                return "none";
              }
            });
          d3.selectAll(".level4").style("display", "none");
        });
      for (let i_3 = 0; i_3 < Class[i_1].children[i_2].children.length; i_3++) {
        var c_3 = all.append("p")
          .append("a")
          .attr("href", "javascript: void(0);")
          .classed("level3", true)
          .classed("branch_" + i_1, true)
          .classed("branch_at_" + i_1 + "_" + i_2, true)
          .attr("id", "root_" + i_1 + "_" + i_2 + "_" + i_3)
          .style("line-height", "1.2em")
          .style("display", "none")
          .style("color", colorset.sunset[2])
          .html("&nbsp;&nbsp;&nbsp;&nbsp;" + Class[i_1].children[i_2].children[i_3].name)
          .on("click", function () {
            var child = "branch_at_" + this.id.substring(5, this.id.length);
            d3.selectAll(".level4")
              .style("display", function () {
                if (d3.select(this).classed(child)) {
                  return d3.select(this).style("display") == "block" ? "none" : "block";
                } else {
                  return "none";
                }
              });
          });
        for (let i_4 = 0; i_4 < Class[i_1].children[i_2].children[i_3].children.length; i_4++) {
          var c_4 = all.append("p")
            .append("a")
            .attr("href", "javascript: void(0);")
            .classed("level4", true)
            .classed("branch_" + i_1, true)
            .classed("branch_" + i_1 + "_" + i_2, true)
            .classed("branch_at_" + i_1 + "_" + i_2 + "_" + i_3, true)
            .style("line-height", "1em")
            .style("display", "none")
            .style("color", function () {
              return "#FFD180";
            })
            .html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + Class[i_1].children[i_2].children[i_3].children[i_4].name)
            .on("click", function () {
              $("input[name=Code]").val(
                d3.select(this).html().substring(d3.select(this).html().indexOf('(') + 1, d3.select(this).html().indexOf(')')));
              draw();
            });
        }
      }
    }
  }
}

function paint_analyze(d) {
  if (d == void 0)
    d = [];
  if (d.length == 0) {
    var myChart = echarts.init(document.getElementById('analyze'));
    var app = {};
    app.title = "没有数据";

    let year = [" - "];

    var option = {
      backgroundColor: colorset.background,
      textStyle: {
        color: '#eee'
      },
      color: colorset.sunset,
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      title: {
        text: '运营能力分析 / 偿债能力分析',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#e6e6e6'
        }
      },
      grid: [{
        left: 50,
        right: 20,
        height: '35%'
      }, {
        left: 50,
        right: 20,
        top: '65%',
        height: '30%'
      }],
      xAxis: [{
        type: 'category',
        data: year,
        axisLabel: {
          show: false
        }
      }, {
        gridIndex: 1,
        type: 'category',
        data: year,
        position: 'top',
        axisLabel: {
          show: false
        }
      }],
      yAxis: [{
        type: 'value'
      }, {
        gridIndex: 1,
        type: 'value',
        inverse: true
      }],
      series: [{
        name: '流动比率',
        xAxisIndex: 1,
        yAxisIndex: 1,
        type: 'bar',
        data: []
      }, {
        name: '速动比率',
        xAxisIndex: 1,
        yAxisIndex: 1,
        type: 'bar',
        data: []
      }, {
        name: '现金比例',
        xAxisIndex: 1,
        yAxisIndex: 1,
        type: 'bar',
        data: []
      }, {
        name: '资产负债率',
        xAxisIndex: 1,
        yAxisIndex: 1,
        type: 'bar',
        data: []
      }, {
        name: '应收账款周转率',
        type: 'bar',
        data: []
      }, {
        name: '存货周转率',
        type: 'bar',
        data: []
      }, {
        name: '总资产周转率',
        type: 'bar',
        data: []
      }]
    };

    if (option && typeof option === "object") {
      myChart.setOption(option, true);
    }

    return;
  }

  var y = incase.year;
  var type = incase.ctx;
  for (var i = 0; i < dataset[y][type].Income.length; i++) {
    if (dataset[y][type].Income[i].Code == d[0].Code) {
      for (var m = 0; m < d.length; m++) {
        d[m].Income = dataset[y][type].Income[i];
      }
      break;
    }
  }
  for (var i = 0; i < dataset[y][type].CashFlow.length; i++) {
    if (dataset[y][type].CashFlow[i].Code == d[0].Code) {
      for (var m = 0; m < d.length; m++) {
        d[m].CashFlow = dataset[y][type].CashFlow[i];
      }
      break;
    }
  }

  var myChart = echarts.init(document.getElementById('analyze'));

  let data = [];
  for (let i = 0; i < 7; i++) {
    data.push([]);
  }

  let year = [];

  var option = null;

  var averCheck = 0;
  var averRepo = 0;
  var averAssets = 0;
  for (let i = 0; i < d.length; i++) {
    averCheck += parseInt(d[i].ToCheckIn);
    averRepo += parseInt(d[i].Repo);
    averAssets += parseInt(d[i].TotalAssets);
  }
  averCheck /= d.length;
  averRepo /= d.length;
  averAssets /= d.length;

  for (let i = 0; i < d.length; i++) {
    year.push(d[i].year);
    data[0].push(parseInt(d[i].CurrentAssets / d[i].CurrentLiability * 1000) / 1000);
    data[1].push(parseInt(d[i].ValidAssets / d[i].CurrentLiability * 1000) / 1000);
    data[2].push(parseInt(d[i].CheckAssets / d[i].CurrentLiability * 1000) / 1000);
    data[3].push(parseInt(d[i].TotalLiability / d[i].TotalAssets * 1000) / 1000);
    data[4].push(parseInt(d[i].CashFlow.FromOperation / averCheck * 1000) / 1000);
    data[5].push(parseInt(d[i].Income.TotalCost / averRepo * 1000) / 1000);
    data[6].push(parseInt(d[i].CashFlow.FromOperation / averAssets * 1000) / 1000);
  }

  for (var i = 0; i < year.length; i++) {
    var max = parseInt(year[0]);
    var index = 0;
    for (var j = 0; j < year.length - i; j++) {
      if (parseInt(year[j]) > max) {
        max = parseInt(year[j]);
        index = j;
      }
    }
    if (index != year.length - i - 1) {
      var obj = year[index];
      year[index] = year[year.length - 1];
      year[year.length - 1] = obj;
      for (var j = 0; j < 7; j++) {
        obj = data[j][index];
        data[j][index] = data[j][data[j].length - 1];
        data[j][data[j].length - 1] = obj;
      }
    }
  }

  option = {
    backgroundColor: colorset.background,
    textStyle: {
      color: '#eee'
    },
    color: colorset.sunset,
    tooltip: {
      trigger: 'axis',
      axisPointer: { // 坐标轴指示器，坐标轴触发有效
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      }
    },
    title: {
      text: "运营能力分析 / 偿债能力分析",
      left: 'center',
      top: 10,
      textStyle: {
        color: '#e6e6e6'
      }
    },
    grid: [{
      left: 50,
      right: 20,
      height: '35%'
    }, {
      left: 50,
      right: 20,
      top: '65%',
      height: '30%'
    }],
    xAxis: [{
      type: 'category',
      data: year,
      axisLabel: {
        show: false
      }
    }, {
      gridIndex: 1,
      type: 'category',
      data: year,
      position: 'top',
      axisLabel: {
        show: false
      }
    }],
    yAxis: [{
      type: 'value'
    }, {
      gridIndex: 1,
      type: 'value',
      inverse: true
    }],
    series: [{
      name: '流动比率',
      type: 'bar',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: data[0]
    }, {
      name: '速动比率',
      type: 'bar',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: data[1]
    }, {
      name: '现金比例',
      type: 'bar',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: data[2]
    }, {
      name: '资产负债率',
      xAxisIndex: 1,
      yAxisIndex: 1,
      type: 'bar',
      data: data[3]
    }, {
      name: '应收账款周转率',
      type: 'bar',
      data: data[4]
    }, {
      name: '存货周转率',
      type: 'bar',
      data: data[5]
    }, {
      name: '总资产周转率',
      type: 'bar',
      data: data[6]
    }]
  };

  if (option && typeof option === "object") {
    myChart.setOption(option, true);
  }
}

paint_analyze([]);

var mdsData = {};

function drawMDS(y, ctx) {
  var myChart = echarts.init(document.getElementById('chart2'));
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

      var option = {
        backgroundColor: colorset.background,
        textStyle: {
          color: '#eee'
        },
        dataZoom: [{
            id: 'dataZoomX',
            type: 'slider',
            xAxisIndex: [0],
            filterMode: 'weakFilter'
          },
          {
            id: 'dataZoomY',
            type: 'slider',
            yAxisIndex: [0],
            filterMode: 'weakFilter'
          }
        ],
        color: colorset.sunset,
        title: {
          text: "特征值降维",
          left: 'center',
          top: 10,
          textStyle: {
            color: '#e6e6e6'
          }
        },
        xAxis: {},
        yAxis: {},
        series: [{
          symbolSize: 10,
          symbol: "rect",
          label: {
            emphasis: {
              show: true,
              formatter: function (param) {
                return param.data[2];
              },
              position: 'top'
            }
          },
          data: data,
          type: 'scatter'
        }]
      };

      if (option && typeof option === "object") {
        myChart.setOption(option, true);
      }
    });
    return;
  }
  label = mdsData[y][ctx].label;
  data = mdsData[y][ctx].data;

  var option = {
    backgroundColor: colorset.background,
    textStyle: {
      color: '#eee'
    },
    dataZoom: [{
        id: 'dataZoomX',
        type: 'slider',
        xAxisIndex: [0],
        filterMode: 'weakFilter'
      },
      {
        id: 'dataZoomY',
        type: 'slider',
        yAxisIndex: [0],
        filterMode: 'weakFilter'
      }
    ],
    color: colorset.sunset,
    title: {
      text: "特征值降维",
      left: 'center',
      top: 10,
      textStyle: {
        color: '#e6e6e6'
      }
    },
    xAxis: {},
    yAxis: {},
    series: [{
      symbolSize: 10,
      symbol: rect,
      label: {
        emphasis: {
          show: true,
          formatter: function (param) {
            return param.data[2];
          },
          position: 'top'
        }
      },
      data: data,
      type: 'scatter'
    }]
  };

  if (option && typeof option === "object") {
    myChart.setOption(option, true);
  }
}

// 柱状图配置项
{
  var param = "TotalAssets";

  var width = parseInt(d3.select("#chart").style("width")) - 4;
  var height = parseInt(d3.select("#chart").style("height")) - 4;
  var padding = {
    top: 40,
    right: 20,
    bottom: 20,
    left: 20
  };
  var svg = null;

  var yScale = null;

  var animation = 1000;

  var color = {
    init: colorset.sunset[3],
    in: colorset.sunset[0]
  };

  var _data = [];

  var rectStep = /*8 * */ parseInt(width) / _data.length;
  var rectWidth = rectStep * 0.6;

  var max;
  var min;
  var average;
}

function layout() {
  d3.select("#ranking").selectAll("rect").transition().duration(animation * 0.8).attr("fill", color.in);
  d3.select("#column-" + $("input[name=Code]").val()).transition().duration(animation * 0.8).attr("fill", "white");
  if (_data == dataset[incase.year][incase.ctx].Balance) {
    return;
  }
  _data = dataset[incase.year][incase.ctx].Balance;

  rectStep = /*8 * */ parseInt(width) / _data.length;
  rectWidth = rectStep * 0.6;

  max = parseInt(_data[0][param]);
  min = parseInt(_data[0][param]);
  average = parseInt(_data[0][param]);

  for (let i = 1; i < _data.length; i++) {
    _data[i].index = i;
    if (parseInt(_data[i][param]) > max) {
      max = parseInt(_data[i][param]);
    }
    if (parseInt(_data[i][param]) < min) {
      min = parseInt(_data[i][param]);
    }
    average += parseInt(_data[i][param]);
  }
  min = min > 0 ? min * 0.9 : min * 1.1;
  max = max > 0 ? max * 1.1 : max * 0.9;
  average /= _data.length;

  yScale = d3.scale.linear()
    .domain([min, max])
    .range([0, parseInt(height) - padding.top - padding.bottom]);

  for (let i = 0; i < _data.length; i++) {
    let min = _data[0][param];
    let index = 0;
    for (let j = 0; j < _data.length - i; j++) {
      if (parseFloat(_data[j][param]) < min) {
        min = parseFloat(_data[j][param]);
        index = j;
      }
    }
    let temp = _data[_data.length - 1 - i];
    _data[_data.length - 1 - i] = _data[index];
    _data[index] = temp;
  }
  // console.log(_data);

  if (d3.select("#analyze_2").html() == "") {
    svg = d3.select("#analyze_2")
      .append("svg")
      .attr("id", "ranking")
      .attr("width", width - padding.left - padding.right)
      .style("margin-left", padding.left + "px")
      .attr("height", height)
      .attr("version", "1.1")
      .attr("xmlns", "http://www.w3.org/2000/svg");
  } else {
    svg = d3.select("#ranking");
  }

  let rectUpdate = svg.selectAll("rect").data(_data);
  let rectEnter = rectUpdate.enter();
  let rectExit = rectUpdate.exit();

  rectUpdate.transition()
    .duration(animation)
    .attr("fill", function(d){
      return (d.Code == $("input[name=Code]").val()) ? "white" : color.in;
    })
    .style("opacity", 1)
    .attr("x", function (d, i) {
      return d.index * rectStep;
    })
    .attr("y", function (d) {
      return parseInt(height) - padding.bottom - yScale(parseInt(d[param]));
    })
    .attr("width", rectWidth)
    .attr("height", function (d) {
      return yScale(parseInt(d[param]));
    })
    .transition()
    .delay(2000)
    .duration(animation)
    .attr("x", function (d, i) {
      return i * rectStep;
    });

  rectEnter.append("rect")
    .attr("id", function (d) {
      return "column-" + d.Code;
    })
    .attr("fill", color.init)
    .style("opacity", 1)
    .attr("x", function (d, i) {
      return d.index * rectStep;
    })
    .attr("y", parseInt(height) - padding.bottom - yScale(parseInt(average)))
    .attr("width", 0)
    .attr("height", yScale(average))
    .transition()
    .duration(animation)
    .attr("fill", function(d){
      return (d.Code == $("input[name=Code]").val()) ? "white" : color.in;
    })
    .attr("y", function (d) {
      return parseInt(height) - padding.bottom - yScale(parseInt(d[param]));
    })
    .attr("width", rectWidth)
    .attr("height", function (d) {
      return yScale(parseInt(d[param]));
    })
    .transition()
    .delay(2000)
    .duration(animation)
    .attr("x", function (d, i) {
      return i * rectStep;
    });

  rectExit.transition()
    .duration(animation)
    .style("opacity", 0)
    .attr("width", 0);
}