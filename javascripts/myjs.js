/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-04 10:56:05 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-09 00:42:43
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
}

function draw() {
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
  paint_detail(objset, prtset);
  if (incase.ctx == "Merge") {
    paint_analyze(objset);
    paint_pic2(objset);
  } else {
    paint_analyze(prtset);
    paint_pic2(prtset);
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

function paint_detail(dataObj, prtset) {
  if (prtset == void 0)
    prtset = [];
  if (dataObj.length == 0 && prtset.length == 0) {
    var myChart = echarts.init(document.getElementById('chart'));
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
        },
        formatter: function (params, ticket, callback) {
          let res = params[0].name + "年";
          for (let i = 0, l = params.length; i < l; i++) {
            if (parseInt(params[i].value) > 1000000) {
              res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + parseInt(params[i].value / 1000000) / 100 + ' 亿元';
            } else {
              res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + parseInt(params[i].value / 100) / 100 + ' 万元';
            }
          }
          return res;
        },
      },
      title: {
        text: '资产负债明细',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#e6e6e6'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: year
      }],
      yAxis: [{
        type: 'value',
        axisLabel: {
          formatter: function (value, index) {
            return parseInt(value) >= 10000000 ? parseInt(value / 1000000) / 100 + "亿元" : parseInt(value / 10000) + "万元";
          }
        }
      }],
      series: [{
        name: '资产总计',
        type: 'bar',
        stack: '资产总计',
        barWidth: 8,
        data: []
      }, {
        name: '流动资产',
        type: 'bar',
        stack: '资产',
        data: []
      }, {
        name: '固定资产',
        type: 'bar',
        stack: '资产',
        data: []
      }, {
        name: '负债总计',
        type: 'bar',
        stack: '负债总计',
        barWidth: 8,
        data: []
      }, {
        name: '流动负债',
        type: 'bar',
        stack: '负债',
        data: []
      }, {
        name: '固定负债',
        type: 'bar',
        stack: '负债',
        data: []
      }]
    };

    if (option && typeof option === "object") {
      myChart.setOption(option, true);
    }

    return;
  }

  var myChart = echarts.init(document.getElementById('chart'));

  let data = [];
  for (let i = 0; i < 14; i++) {
    data.push([]);
  }

  let year = [];

  var option = null;

  if (prtset.length != 0) {
    for (let i = 0; i < dataObj.length; i++) {
      year.push(dataObj[i].year);
      data[0].push(parseInt(dataObj[i].TotalAssets));
      data[1].push(parseInt(dataObj[i].CurrentAssets));
      data[2].push(parseInt(dataObj[i].FixedAssets));
      data[3].push(parseInt(dataObj[i].TotalLiability));
      data[4].push(parseInt(dataObj[i].CurrentLiability));
      data[5].push(parseInt(dataObj[i].FixedLiability));
      data[6].push(parseInt(prtset[i].TotalAssets));
      data[7].push(parseInt(prtset[i].CurrentAssets));
      data[8].push(parseInt(prtset[i].FixedAssets));
      data[9].push(parseInt(prtset[i].TotalLiability));
      data[10].push(parseInt(prtset[i].CurrentLiability));
      data[11].push(parseInt(prtset[i].FixedLiability));
      data[12].push(parseInt(dataObj[i].TotalEquity));
      data[13].push(parseInt(prtset[i].TotalEquity));
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
        for (var j = 0; j < 12; j++) {
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
        },
        formatter: function (params, ticket, callback) {
          let res = params[0].name + "年";
          for (let i = 0, l = params.length; i < l; i++) {
            if (parseInt(params[i].value) > 10000000) {
              res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + parseInt(params[i].value / 1000000) / 100 + ' 亿元';
            } else {
              res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + parseInt(params[i].value / 100) / 100 + ' 万元';
            }
          }
          return res;
        },
      },
      title: {
        text: "资产负债明细",
        left: 'center',
        top: 10,
        textStyle: {
          color: '#e6e6e6'
        }
      },
      // legend: {
      //   data: ['资产总计（母公司）', '流动资产（母公司）', '固定资产（母公司）', '负债总计（母公司）', '流动负债（母公司）', '固定负债（母公司）',
      //     '资产总计（合并）', '流动资产（合并）', '固定资产（合并）', '负债总计（合并）', '流动负债（合并）', '固定负债（合并）'
      //   ],
      //   orient: "vertical",
      //   left: "right"
      // },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: year
      }],
      yAxis: [{
        type: 'value',
        axisLabel: {
          formatter: function (value, index) {
            return parseInt(value) >= 10000000 ? parseInt(value / 1000000) / 100 + "亿元" : parseInt(value / 10000) + "万元";
          }
        }
      }],
      series: [{
        name: '资产总计（母公司）',
        type: 'bar',
        stack: '资产总计（母公司）',
        barWidth: 6,
        data: data[6]
      }, {
        name: '流动资产（母公司）',
        type: 'bar',
        stack: '资产（母公司）',
        data: data[7]
      }, {
        name: '固定资产（母公司）',
        type: 'bar',
        stack: '资产（母公司）',
        data: data[8]
      }, {
        name: '资产总计（合并）',
        type: 'bar',
        stack: '资产总计（合并）',
        barWidth: 6,
        data: data[0]
      }, {
        name: '流动资产（合并）',
        type: 'bar',
        stack: '资产（合并）',
        data: data[1]
      }, {
        name: '固定资产（合并）',
        type: 'bar',
        stack: '资产（合并）',
        data: data[2]
      }, {
        name: '负债总计（母公司）',
        type: 'bar',
        stack: '负债总计（母公司）',
        barWidth: 6,
        data: data[9]
      }, {
        name: '流动负债（母公司）',
        type: 'bar',
        stack: '负债（母公司）',
        data: data[10]
      }, {
        name: '固定负债（母公司）',
        type: 'bar',
        stack: '负债（母公司）',
        data: data[11]
      }, {
        name: '负债总计（合并）',
        type: 'bar',
        stack: '负债总计（合并）',
        barWidth: 6,
        data: data[3]
      }, {
        name: '流动负债（合并）',
        type: 'bar',
        stack: '负债（合并）',
        data: data[4]
      }, {
        name: '固定负债（合并）',
        type: 'bar',
        stack: '负债（合并）',
        data: data[5]
      }, {
        name: '所有者权益总计（合并）',
        type: 'bar',
        stack: '所有者权益总计（合并）',
        data: data[12]
      }, {
        name: '所有者权益总计（母公司）',
        type: 'bar',
        stack: '所有者权益总计（母公司）',
        data: data[13]
      }]
    };
  } else {
    for (let i = 0; i < dataObj.length; i++) {
      year.push(dataObj[i].year);
      data[0].push(parseInt(dataObj[i].TotalAssets));
      data[1].push(parseInt(dataObj[i].CurrentAssets));
      data[2].push(parseInt(dataObj[i].FixedAssets));
      data[3].push(parseInt(dataObj[i].TotalLiability));
      data[4].push(parseInt(dataObj[i].CurrentLiability));
      data[5].push(parseInt(dataObj[i].FixedLiability));
      data[6].push(parseInt(dataObj[i].TotalEquity));
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
        for (var j = 0; j < 6; j++) {
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
        },
        formatter: function (params, ticket, callback) {
          let res = params[0].name + "年";
          for (let i = 0, l = params.length; i < l; i++) {
            if (parseInt(params[i].value) > 10000000) {
              res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + parseInt(params[i].value / 1000000) / 100 + ' 亿元';
            } else {
              res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + parseInt(params[i].value / 100) / 100 + ' 万元';
            }
          }
          return res;
        },
      },
      title: {
        text: "资产负债明细",
        left: 'center',
        top: 10,
        textStyle: {
          color: '#e6e6e6'
        }
      },
      // legend: {
      //   data: ['资产总计', '流动资产', '固定资产', '负债总计', '流动负债', '固定负债'],
      //   orient: "vertical",
      //   left: "right"
      // },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: year
      }],
      yAxis: [{
        type: 'value',
        axisLabel: {
          formatter: function (value, index) {
            return parseInt(value) >= 100000000 ? parseInt(value / 1000000) / 100 + "亿元" : parseInt(value / 10000) + "万元";
          }
        }
      }],
      series: [{
        name: '资产总计',
        type: 'bar',
        stack: '资产总计',
        barWidth: 8,
        data: data[0]
      }, {
        name: '流动资产',
        type: 'bar',
        stack: '资产',
        data: data[1]
      }, {
        name: '固定资产',
        type: 'bar',
        stack: '资产',
        data: data[2]
      }, {
        name: '负债总计',
        type: 'bar',
        stack: '负债总计',
        barWidth: 8,
        data: data[3]
      }, {
        name: '流动负债',
        type: 'bar',
        stack: '负债',
        data: data[4]
      }, {
        name: '固定负债',
        type: 'bar',
        stack: '负债',
        data: data[5]
      }, {
        name: '所有者权益总计',
        type: 'bar',
        stack: '所有者权益总计',
        data: data[12]
      }]
    };
  }

  if (option && typeof option === "object") {
    myChart.setOption(option, true);
  }
}

paint_detail([], []);

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
      }, {
        r0: 85,
        r: 120,
        itemStyle: {
          shadowBlur: 2,
          shadowColor: 'transparent'
        },
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
        r0: 120,
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
        text: '偿债能力分析',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#e6e6e6'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: year
      }],
      yAxis: [{
        type: 'value'
      }],
      series: [{
        name: '流动比率',
        type: 'bar',
        data: []
      }, {
        name: '速动比率',
        type: 'bar',
        data: []
      }, {
        name: '现金比例',
        type: 'bar',
        data: []
      }, {
        name: '资产负债率',
        type: 'bar',
        data: []
      }]
    };

    if (option && typeof option === "object") {
      myChart.setOption(option, true);
    }

    return;
  }

  var myChart = echarts.init(document.getElementById('analyze'));

  let data = [];
  for (let i = 0; i < 4; i++) {
    data.push([]);
  }

  let year = [];

  var option = null;

  for (let i = 0; i < d.length; i++) {
    year.push(d[i].year);
    data[0].push(parseInt(d[i].CurrentAssets / d[i].CurrentLiability * 1000) / 1000);
    data[1].push(parseInt(d[i].ValidAssets / d[i].CurrentLiability * 1000) / 1000);
    data[2].push(parseInt(d[i].CheckAssets / d[i].CurrentLiability * 1000) / 1000);
    data[3].push(parseInt(d[i].TotalLiability / d[i].TotalAssets * 1000) / 1000);
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
      for (var j = 0; j < 4; j++) {
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
      },
      // formatter: function (params, ticket, callback) {
      //   let res = params[0].name + "年";
      //   for (let i = 0, l = params.length; i < l; i++) {
      //     if (parseInt(params[i].value) > 10000000) {
      //       res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + parseInt(params[i].value / 1000000) / 100 + ' 亿元';
      //     } else {
      //       res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + parseInt(params[i].value / 100) / 100 + ' 万元';
      //     }
      //   }
      //   return res;
      // },
    },
    title: {
      text: "偿债能力分析",
      left: 'center',
      top: 10,
      textStyle: {
        color: '#e6e6e6'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      data: year
    }],
    yAxis: [{
      type: 'value',
      // axisLabel: {
      //   formatter: function (value, index) {
      //     return parseInt(value) >= 10000000 ? parseInt(value / 1000000) / 100 + "亿元" : parseInt(value / 10000) + "万元";
      //   }
      // }
    }],
    series: [{
      name: '流动比率',
      type: 'bar',
      stack: '1',
      data: data[0]
    }, {
      name: '速动比率',
      type: 'bar',
      stack: '2',
      data: data[1]
    }, {
      name: '现金比例',
      type: 'bar',
      stack: '3',
      data: data[2]
    }, {
      name: '资产负债率',
      type: 'bar',
      stack: '4',
      data: data[3]
    }]
  };

  if (option && typeof option === "object") {
    myChart.setOption(option, true);
  }
}

paint_analyze([]);

function paint_pic2(d) {
  if (d == void 0)
    d = [];
  if (d.length == 0) {
    var myChart = echarts.init(document.getElementById('analyze_2'));
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
        text: '运营能力分析',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#e6e6e6'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: year
      }],
      yAxis: [{
        type: 'value'
      }],
      series: [{
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

  var y = "2017";
  var type = "Merge";
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

  var myChart = echarts.init(document.getElementById('analyze_2'));

  let data = [];
  for (let i = 0; i < 3; i++) {
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
    data[0].push(parseInt(d[i].CashFlow.FromOperation / averCheck * 1000) / 1000);
    data[1].push(parseInt(d[i].Income.TotalCost / averRepo * 1000) / 1000);
    data[2].push(parseInt(d[i].CashFlow.FromOperation / averAssets * 1000) / 1000);
    // console.log(d[i].CashFlow.FromOperation, averCheck);
    // console.log(d[i].Income.TotalCost, averRepo);
    // console.log(d[i].CashFlow.FromOperation, averAssets);
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
      for (var j = 0; j < 3; j++) {
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
      },
      // formatter: function (params, ticket, callback) {
      //   let res = params[0].name + "年";
      //   for (let i = 0, l = params.length; i < l; i++) {
      //     if (parseInt(params[i].value) > 10000000) {
      //       res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + parseInt(params[i].value / 1000000) / 100 + ' 亿元';
      //     } else {
      //       res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + parseInt(params[i].value / 100) / 100 + ' 万元';
      //     }
      //   }
      //   return res;
      // },
    },
    title: {
      text: "运营能力分析",
      left: 'center',
      top: 10,
      textStyle: {
        color: '#e6e6e6'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      data: year
    }],
    yAxis: [{
      type: 'value',
      // axisLabel: {
      //   formatter: function (value, index) {
      //     return parseInt(value) >= 10000000 ? parseInt(value / 1000000) / 100 + "亿元" : parseInt(value / 10000) + "万元";
      //   }
      // }
    }],
    series: [{
      name: '应收账款周转率',
      type: 'bar',
      data: data[0]
    }, {
      name: '存货周转率',
      type: 'bar',
      data: data[1]
    }, {
      name: '总资产周转率',
      type: 'bar',
      data: data[2]
    }]
  };

  if (option && typeof option === "object") {
    myChart.setOption(option, true);
  }
}

paint_pic2([]);