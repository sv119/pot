/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-04 10:56:05 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-13 14:00:09
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
  var NOTFOUND = {};
  var csv = d3.dsv(",", "text/csv;charset=gb2312");
  csv(SRC.Rule, function (data) {
    LoadClassInfo(data);
    buildTree();
    csv(SRC.Dictionary, function (data) {
      LoadDictionary(data);
      csv(SRC.BalanceSheet, function (data) {
        Sheets.BalanceSheet = data;
        for (let i = 0; i < data.length; i++) {
          try {
            let txt = d3.select("#item-" + data[i].SECURITY_CODE).text();
            d3.select("#item-" + data[i].SECURITY_CODE)
              .html('<img src="../images/icon05.png" style="width:16px;height:16px;float:left">')
              .append("a")
              .attr("href", "javascript: void(0);")
              .text(txt)
              .on("click", function () {
                $("input[name=Code]").val(
                  d3.select(this).text().substring(d3.select(this).text().indexOf('(') + 1, d3.select(this).text().indexOf(')')));
                draw();
              });
          } catch (error) {
            if (NOTFOUND[data[i].SECURITY_CODE] == void 0) {
              console.warn("警告：" + data[i].SECURITY_NAME + " (" + data[i].SECURITY_CODE + ") 查找不到有效的分类信息，数据加载失败！");
              NOTFOUND[data[i].SECURITY_CODE] = 1;
            }
          }
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
  $("input[name='optionsRadiosinline'][value='TotalAssets']").prop("checked", true);
  $("input[name=Code]").val("");
  document.getElementById("inputCode").focus();
  paint_portrait([]);
  if (incase.ctx == "Merge") {
    drawMDS(incase.year, "m");
  } else {
    drawMDS(incase.year, "p");
  }
}

function draw() {
  layout(false);
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

  if (objset.length == 0 && prtset.length == 0) {
    paint_portrait([]);
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
      paint_portrait(Sheets.BalanceSheet[i]);
      break;
    }
  }
}

var portrait = new Portrait.Chart('sunburst');

function paint_portrait(d) {
  if (d == void 0)
    d = [];
  if (d.length == 0) {
    var data = [{
      label: '没有数据',
      value: '',
      children: []
    }];
    var option = {
      margin: 20,
      // border: "1px solid white",
      // animation: 1000,
      data: data
    };

    if (option && typeof option === "object") {
      portrait.setOption(option);
    }
    return;
  }

  var data = [{
    label: '资产总计',
    value: '?',
    children: [{
      label: '流动资产',
      value: '?',
      children: []
    }, {
      label: '非流动资产',
      value: '?',
      children: []
    }]
  }, {
    label: '负债总计',
    value: '?',
    children: [{
      label: '流动负债',
      value: '?',
      children: []
    }, {
      label: '非流动负债',
      value: '?',
      children: []
    }]
  }, {
    label: '所有者权益',
    value: '?',
    children: [{
      label: '所有者权益总计',
      value: '?',
      children: []
    }]
  }];

  // 流动资产
  var all = parseInt(d["BAME00030M"]);
  var others = 0;
  var para = "BAME00";
  for (var num = 3; num <= 83; num++) {
    var spaner = num < 10 ? "0" + num : num;
    if (nameof[para + spaner + "0M"].indexOf("其中：") != -1)
      continue;
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 6) {
      var child = {
        label: enter(nameof[para + spaner + "0M"], 5),
        value: val
      };
      data[0]['children'][0]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }
  var child = {
    label: "其他",
    value: others
  };
  data[0]['children'][0]['children'].push(child);

  // 非流动资产
  all = parseInt(d["BAME01320M"]);
  others = 0;
  para = "BAME0";
  for (var num = 86; num <= 131; num++) {
    var spaner = num < 100 ? "0" + num : num;
    if (nameof[para + spaner + "0M"].indexOf("其中：") != -1)
      continue;
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 6) {
      var child = {
        label: enter(nameof[para + spaner + "0M"], 5),
        value: val
      };
      data[0]['children'][1]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }
  child = {
    label: "其他",
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
        label: enter(nameof[para + spaner + "0M"], 5),
        value: val
      };
      data[1]['children'][0]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }
  child = {
    label: "其他",
    value: others
  };
  data[1]['children'][0]['children'].push(child);

  // 非流动负债
  all = parseInt(d["BAME02190M"]);
  others = 0;
  para = "BAME0";
  for (var num = 200; num <= 218; num++) {
    var spaner = num.toString();
    if (nameof[para + spaner + "0M"].indexOf("其中：") != -1)
      continue;
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 6) {
      var child = {
        label: enter(nameof[para + spaner + "0M"], 5),
        value: val
      };
      data[1]['children'][1]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }
  child = {
    label: "其他",
    value: others
  };
  data[1]['children'][1]['children'].push(child);

  // 所有者权益总计
  all = parseInt(d["BAME02470M"]);
  others = 0;
  para = "BAME0";
  for (var num = 223; num <= 246; num++) {
    var spaner = num.toString();
    if (nameof[para + spaner + "0M"].indexOf("其中：") != -1)
      continue;
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 6) {
      var child = {
        label: enter(nameof[para + spaner + "0M"], 5),
        value: val
      };
      data[2]['children'][0]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }
  child = {
    label: "其他",
    value: others
  };
  data[2]['children'][0]['children'].push(child);

  var option = {
    margin: 20,
    // border: "1px solid white",
    // animation: 1000,
    data: [{
      label: "企业画像",
      value: '',
      children: data
    }]
  };
  if (option && typeof option === "object") {
    portrait.setOption(option);
  }
}

function buildTree() {
  var all = d3.select("#tree_well").select("ul");

  for (let i_1 = 0; i_1 < Class.length; i_1++) {
    if (Class[i_1].name == "")
      continue;
    var c_1 = all.append("li")
      .html('<img src="../images/icon03.png" style="width:16px;height:16px;float:left"></img><span><i class="icon-folder-open"></i>' + Class[i_1].name + '</span>')
      .append("ul")
      .style("padding-left", "25px");
    for (let i_2 = 0; i_2 < Class[i_1].children.length; i_2++) {
      var c_2 = c_1.append("li")
        .style("display", "none")
        .html('<img src="../images/icon01.png" style="width:16px;height:16px;float:left"></img><span><i class="icon-minus-sign"></i>' + Class[i_1].children[i_2].name + '</span>')
        .append("ul")
        .style("padding-left", "25px");
      for (let i_3 = 0; i_3 < Class[i_1].children[i_2].children.length; i_3++) {
        var c_3 = c_2.append("li")
          .style("display", "none")
          .html('<img src="../images/icon02.png" style="width:16px;height:16px;float:left"></img><span><i class="icon-minus-sign"></i>' +
            Class[i_1].children[i_2].children[i_3].name + '</span>')
          .append("ul")
          .style("padding-left", "25px");
        for (let i_4 = 0; i_4 < Class[i_1].children[i_2].children[i_3].children.length; i_4++) {
          var c_4 = c_3.append("li")
            .style("display", "none")
            .append("span")
            .style("color", "#666")
            .attr("id", function () {
              var str = Class[i_1].children[i_2].children[i_3].children[i_4].name;
              return "item-" + str.substring(str.indexOf('(') + 1, str.indexOf(')'));
            })
            .html('<img src="../images/icon05.png" style="width:16px;height:16px;float:left"></img><i class="icon-leaf"></i>' +
              Class[i_1].children[i_2].children[i_3].children[i_4].name);
        }
      }
    }
  }

  $(function () {
    $('.tree li:has(ul)').addClass('parent_li').find(' > span');
    $('.tree li.parent_li > span').on('click', function (e) {
      var children = $(this).parent('li.parent_li').find(' > ul > li');
      if (children.is(":visible")) {
        children.hide('fast');
        $(this).find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
      } else {
        children.show('fast');
        $(this).find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
      }
      e.stopPropagation();
    });
  });
}

{
  /*
  function paint_analyze(d) {
    if (d == void 0)
      d = [];
    if (d.length == 0) {
      var myChart = echarts.init(document.getElementById('analyze'));
      var app = {};
      app.title = "没有数据";

      let year = [" - "];

      var option = {
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
            color: '#00f6ff'
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
          color: '#00f6ff'
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
  */
}

// 散点图配置项
{
  var mdstip = d3.select("body")
    .append("div")
    .attr("id", "point-view")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("opacity", "0.7")
    .style("border", "solid");

  var mdsData = {};

  var svg = d3.select("#mds")
    .append("svg")
    .attr("id", "mdssvg")
    .attr("width", "530px")
    .attr("height", "360px");
}

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

      var svg = d3.select("#mdssvg");

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
          mdstip.html(d[2] + d[3]);
          mdstip.style("visibility", "visible");
        })
        .on('mousemove', function () {
          mdstip.style('top', (parseInt(d3.event.pageY) - 10) + 'px').style('left', (parseInt(d3.event.pageX) + 10) + 'px')
        })
        .on("mouseout", function () {
          d3.select(this)
            .transition()
            .duration(300)
            .attr("fill", "#3564e6")
            .attr("r", 6)
            .attr("opacity", "0.6");
          mdstip.style("visibility", "hidden");
        });
    });
    return;
  }
  label = mdsData[y][ctx].label;
  data = mdsData[y][ctx].data;
}

// 柱状图配置项
{
  var param = ($("input[name='optionsRadiosinline']:checked").val());

  var width = parseInt(d3.select("#analyze_2").style("width")) - 4;
  var height = parseInt(d3.select("#analyze_2").style("height")) - 4;
  var padding = {
    top: 46,
    right: 20,
    bottom: 10,
    left: 20
  };
  var svg = null;

  var yScale = null;
  var trans = 0;
  var columnAt = 0;

  var animation = 1000;

  var color = {
    init: colorset.sunset[3],
    in: colorset.sunset[0]
  };

  var _data = [];

  var rectStep = 10 * parseInt(width) / _data.length;
  var rectWidth = rectStep * 0.6;

  var max;
  var min;
  var average;

  var tooltip = d3.select("body")
    .append("div")
    .classed("dragtip", true)
    .style("opacity", 0.0)
    .style("position", "absolute");
}

function layout(ensure) {
  d3.select("#ranking").selectAll("rect").attr("fill", color.in);
  d3.select("#column-" + $("input[name=Code]").val()).attr("fill", "white");

  let highlighted = d3.select("#column-" + $("input[name=Code]").val());

  try {
    let center = parseInt(width) / 2 - (padding.left + padding.right) / 2;
    let start = parseFloat(highlighted.attr("x")) + parseFloat(highlighted.attr("transform").substring(10, highlighted.attr("transform").indexOf(',')));
    let dx = center - start - rectWidth;
    trans += dx;
    trans = trans > 0 ? 0 : trans;

    for (let i = 0; i < _data.length; i++) {
      if (_data[i].Code == $("input[name=Code]").val()) {
        columnAt = i;
        break;
      }
    }
    let begin = columnAt < 10 ? 0 : columnAt - 10;
    let _max = parseInt(_data[begin][param]);
    for (let i = begin + 1; i < _data.length && i < begin + 21; i++) {
      _data[i].index = i;
      if (parseInt(_data[i][param]) > _max) {
        _max = parseInt(_data[i][param]);
      }
    }
    _max = _max > 0 ? _max * 1.1 : _max * 0.9;
    yScale = d3.scale.linear()
      .domain([min, _max])
      .range([0, parseInt(height) - padding.top - padding.bottom]);

    if (_max < max) {
      d3.select("#ranking")
        .selectAll("rect")
        .data(_data)
        .transition()
        .delay(animation)
        .duration(animation)
        .attr("transform", "translate(" + trans + ",0)")
        .attr("fill", function (d) {
          return (d.Code == $("input[name=Code]").val()) ? "white" : color.in;
        })
        .style("opacity", 1)
        .attr("width", rectWidth);

      d3.select("#ranking")
        .selectAll("rect")
        .data(_data)
        .transition()
        .delay(2.1 * animation)
        .duration(animation)
        .attr("y", function (d) {
          return parseInt(height) - padding.bottom - yScale(parseInt(d[param]));
        })
        .attr("height", function (d) {
          return yScale(parseInt(d[param]));
        })
        .attr("x", function (d, i) {
          return i * rectStep;
        });
    } else {
      d3.select("#ranking")
        .selectAll("rect")
        .data(_data)
        .transition()
        .delay(animation)
        .duration(animation)
        .attr("y", function (d) {
          return parseInt(height) - padding.bottom - yScale(parseInt(d[param]));
        })
        .attr("height", function (d) {
          return yScale(parseInt(d[param]));
        })
        .attr("x", function (d, i) {
          return i * rectStep;
        });

      d3.select("#ranking")
        .selectAll("rect")
        .data(_data)
        .transition()
        .delay(2.1 * animation)
        .duration(animation)
        .attr("transform", "translate(" + trans + ",0)")
        .attr("fill", function (d) {
          return (d.Code == $("input[name=Code]").val()) ? "white" : color.in;
        })
        .style("opacity", 1)
        .attr("width", rectWidth);
    }

    max = _max;
  } catch (error) {}

  if (_data == dataset[incase.year][incase.ctx].Balance && !ensure) {
    return;
  }

  _data = dataset[incase.year][incase.ctx].Balance;

  rectStep = 10 * parseInt(width) / _data.length;
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
  min = min > 0 ? 0 : min * 1.1;
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
    .attr("fill", function (d) {
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
    .delay(2000 + 2000 * Math.random())
    .duration(animation + animation * Math.random())
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
    .attr("transform", "translate(" + trans + ",0)")
    .attr("y", parseInt(height) - padding.bottom - yScale(parseInt(average)))
    .attr("width", 0)
    .attr("height", yScale(average))
    .on("mouseover", function (d, i) {
      tooltip.html(rank(i) + "<br />" + d.Name + " (" + d.Code + ")<br />" + param + ": " + format(d[param]))
        .style("left", (d3.event.pageX + 20) + "px")
        .style("top", (d3.event.pageY + 20) + "px")
        .style("opacity", 1.0);
    })
    .on("mousemove", function (d) {
      tooltip.style("left", (d3.event.pageX + 20) + "px")
        .style("top", (d3.event.pageY + 20) + "px");
    })
    .on("mouseout", function (d) {
      tooltip.style("opacity", 0.0);
    })
    .on("click", function () {
      $("input[name=Code]").val(
        this.id.substring(this.id.indexOf('-') + 1, this.id.length));
      draw();
    })
    .transition()
    .duration(animation)
    .attr("fill", function (d) {
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

  if (ensure) {
    layout(false);
  }
}

(function map() {
  var dom = document.getElementById(('map'), 'shine');
  var myChart = echarts.init(dom);
  var app = {};
  option = null;
  var mapName = 'china'
  var data = [{
      name: "北京",
      value: 199
    },
    {
      name: "天津",
      value: 42
    },
    {
      name: "河北",
      value: 102
    },
    {
      name: "山西",
      value: 81
    },
    {
      name: "内蒙古",
      value: 47
    },
    {
      name: "辽宁",
      value: 67
    },
    {
      name: "吉林",
      value: 82
    },
    {
      name: "黑龙江",
      value: 123
    },
    {
      name: "上海",
      value: 24
    },
    {
      name: "江苏",
      value: 92
    },
    {
      name: "浙江",
      value: 114
    },
    {
      name: "安徽",
      value: 109
    },
    {
      name: "福建",
      value: 116
    },
    {
      name: "江西",
      value: 91
    },
    {
      name: "山东",
      value: 119
    },
    {
      name: "河南",
      value: 137
    },
    {
      name: "湖北",
      value: 116
    },
    {
      name: "湖南",
      value: 114
    },
    {
      name: "重庆",
      value: 91
    },
    {
      name: "四川",
      value: 125
    },
    {
      name: "贵州",
      value: 62
    },
    {
      name: "云南",
      value: 83
    },
    {
      name: "西藏",
      value: 9
    },
    {
      name: "陕西",
      value: 80
    },
    {
      name: "甘肃",
      value: 56
    },
    {
      name: "青海",
      value: 10
    },
    {
      name: "宁夏",
      value: 18
    },
    {
      name: "新疆",
      value: 180
    },
    {
      name: "广东",
      value: 123
    },
    {
      name: "广西",
      value: 59
    },
    {
      name: "海南",
      value: 14
    },
  ];

  var geoCoordMap = {};
  var toolTipData = [{
      name: "北京",
      value: [{
        name: "科技人才总数",
        value: 95
      }, {
        name: "理科",
        value: 82
      }]
    },
    {
      name: "天津",
      value: [{
        name: "文科",
        value: 22
      }, {
        name: "理科",
        value: 20
      }]
    },
    {
      name: "河北",
      value: [{
        name: "文科",
        value: 60
      }, {
        name: "理科",
        value: 42
      }]
    },
    {
      name: "山西",
      value: [{
        name: "文科",
        value: 40
      }, {
        name: "理科",
        value: 41
      }]
    },
    {
      name: "内蒙古",
      value: [{
        name: "文科",
        value: 23
      }, {
        name: "理科",
        value: 24
      }]
    },
    {
      name: "辽宁",
      value: [{
        name: "文科",
        value: 39
      }, {
        name: "理科",
        value: 28
      }]
    },
    {
      name: "吉林",
      value: [{
        name: "文科",
        value: 41
      }, {
        name: "理科",
        value: 41
      }]
    },
    {
      name: "黑龙江",
      value: [{
        name: "文科",
        value: 35
      }, {
        name: "理科",
        value: 31
      }]
    },
    {
      name: "上海",
      value: [{
        name: "文科",
        value: 12
      }, {
        name: "理科",
        value: 12
      }]
    },
    {
      name: "江苏",
      value: [{
        name: "文科",
        value: 47
      }, {
        name: "理科",
        value: 45
      }]
    },
    {
      name: "浙江",
      value: [{
        name: "文科",
        value: 57
      }, {
        name: "理科",
        value: 57
      }]
    },
    {
      name: "安徽",
      value: [{
        name: "文科",
        value: 57
      }, {
        name: "理科",
        value: 52
      }]
    },
    {
      name: "福建",
      value: [{
        name: "文科",
        value: 59
      }, {
        name: "理科",
        value: 57
      }]
    },
    {
      name: "江西",
      value: [{
        name: "文科",
        value: 49
      }, {
        name: "理科",
        value: 42
      }]
    },
    {
      name: "山东",
      value: [{
        name: "文科",
        value: 67
      }, {
        name: "理科",
        value: 52
      }]
    },
    {
      name: "河南",
      value: [{
        name: "文科",
        value: 69
      }, {
        name: "理科",
        value: 68
      }]
    },
    {
      name: "湖北",
      value: [{
        name: "文科",
        value: 60
      }, {
        name: "理科",
        value: 56
      }]
    },
    {
      name: "湖南",
      value: [{
        name: "文科",
        value: 62
      }, {
        name: "理科",
        value: 52
      }]
    },
    {
      name: "重庆",
      value: [{
        name: "文科",
        value: 47
      }, {
        name: "理科",
        value: 44
      }]
    },
    {
      name: "四川",
      value: [{
        name: "文科",
        value: 65
      }, {
        name: "理科",
        value: 60
      }]
    },
    {
      name: "贵州",
      value: [{
        name: "文科",
        value: 32
      }, {
        name: "理科",
        value: 30
      }]
    },
    {
      name: "云南",
      value: [{
        name: "文科",
        value: 42
      }, {
        name: "理科",
        value: 41
      }]
    },
    {
      name: "西藏",
      value: [{
        name: "文科",
        value: 5
      }, {
        name: "理科",
        value: 4
      }]
    },
    {
      name: "陕西",
      value: [{
        name: "文科",
        value: 38
      }, {
        name: "理科",
        value: 42
      }]
    },
    {
      name: "甘肃",
      value: [{
        name: "文科",
        value: 28
      }, {
        name: "理科",
        value: 28
      }]
    },
    {
      name: "青海",
      value: [{
        name: "文科",
        value: 5
      }, {
        name: "理科",
        value: 5
      }]
    },
    {
      name: "宁夏",
      value: [{
        name: "文科",
        value: 10
      }, {
        name: "理科",
        value: 8
      }]
    },
    {
      name: "新疆",
      value: [{
        name: "文科",
        value: 36
      }, {
        name: "理科",
        value: 31
      }]
    },
    {
      name: "广东",
      value: [{
        name: "文科",
        value: 63
      }, {
        name: "理科",
        value: 60
      }]
    },
    {
      name: "广西",
      value: [{
        name: "文科",
        value: 29
      }, {
        name: "理科",
        value: 30
      }]
    },
    {
      name: "海南",
      value: [{
        name: "文科",
        value: 8
      }, {
        name: "理科",
        value: 6
      }]
    },
  ];

  /*获取地图数据*/
  myChart.showLoading();
  var mapFeatures = echarts.getMap(mapName).geoJson.features;
  myChart.hideLoading();
  mapFeatures.forEach(function (v) {
    // 地区名称
    var name = v.properties.name;
    // 地区经纬度
    geoCoordMap[name] = v.properties.cp;

  });

  // console.log(data)
  // console.log(toolTipData)
  var max = 480,
    min = 9; // todo 
  var maxSize4Pin = 100,
    minSize4Pin = 20;

  var convertData = function (data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
      var geoCoord = geoCoordMap[data[i].name];
      if (geoCoord) {
        res.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value),
        });
      }
    }
    return res;
  };
  option = {
    tooltip: {
      padding: 0,
      enterable: true,
      transitionDuration: 1,
      textStyle: {
        color: '#000',
        decoration: 'none',
      },
      formatter: function (params) {
        var tipHtml = '';
        tipHtml =
          '<div style="width:150px;height:90px;background:rgba(22,80,158,0.8);border:1px solid rgba(7,166,255,0.7)">' +
          '<div style="width:150px;height:40px;line-height:40px;border-bottom:2px solid rgba(7,166,255,0.7);padding:0 20px">' +
          '<i style="display:inline-block;width:8px;height:8px;background:#16d6ff;border-radius:40px;">' +
          '</i>' +
          '<span style="margin-left:10px;color:#fff;font-size:16px;">' + params.name +
          '</span>' +
          '</div>' +
          '<div style="padding:10px">' +
          '<p style="color:#fff;font-size:12px;">' +
          '<i style="display:inline-block;width:10px;height:10px;background:#16d6ff;border-radius:40px;margin:0 8px">' +
          '</i>' +
          '单位总数：' + '<span style="color:#11ee7d;margin:0 6px;">' + toolTipData.length +
          '</span>' + '个' + '</p>'
        '</div>' + '</div>';

        return tipHtml;
      }

    },

    visualMap: {
      show: true,
      min: 0,
      max: 200,
      left: '10%',
      top: 'bottom',
      calculable: true,
      seriesIndex: [1],
      inRange: {
        color: ['#04387b', '#467bc0'] // 蓝绿
      }
    },
    geo: {
      show: true,
      map: mapName,
      label: {
        normal: {
          show: false
        },
        emphasis: {
          show: false,
        }
      },
      roam: false,
      itemStyle: {
        normal: {
          areaColor: '#023677',
          borderColor: '#1180c7',
        },
        emphasis: {
          areaColor: '#4499d0',
        }
      }
    },
    series: [{
        name: '散点',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: convertData(data),
        symbolSize: function (val) {
          return val[2] / 10;
        },
        label: {
          normal: {
            formatter: '{b}',
            position: 'right',
            show: true
          },
          emphasis: {
            show: true
          }
        },
        itemStyle: {
          normal: {
            color: '#fff'
          }
        }
      },
      {
        type: 'map',
        map: mapName,
        geoIndex: 0,
        aspectScale: 0.75, //长宽比
        showLegendSymbol: false, // 存在legend时显示
        label: {
          normal: {
            show: true
          },
          emphasis: {
            show: false,
            textStyle: {
              color: '#fff'
            }
          }
        },
        roam: true,
        itemStyle: {
          normal: {
            areaColor: '#031525',
            borderColor: '#3B5077',
          },
          emphasis: {
            areaColor: '#2B91B7'
          }
        },
        animation: false,
        data: data
      },
      {
        name: '点',
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 6,
      },
      {
        name: 'Top 5',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: convertData(data.sort(function (a, b) {
          return b.value - a.value;
        }).slice(0, 10)),
        symbolSize: function (val) {
          return val[2] / 10;
        },
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke'
        },
        hoverAnimation: true,
        label: {
          normal: {
            formatter: '{b}',
            position: 'left',
            show: false
          }
        },
        itemStyle: {
          normal: {
            color: 'yellow',
            shadowBlur: 10,
            shadowColor: 'yellow'
          }
        },
        zlevel: 1
      },

    ]
  };
  if (option && typeof option === "object") {
    myChart.setOption(option, true);
  }
})()

function rank(num) {
  num = parseInt(num) + 1;
  if (num == 1) {
    return "<span style='color: red;'><b>1st</b></span>";
  }
  if (num == 2) {
    return "<span style='color: gold;'><b>2nd</b></span>";
  }
  if (num == 3) {
    return "<span style='color: orange;'><b>3rd</b></span>";
  }
  if (num < 11) {
    return "<span><b>" + num + "th</b></span>";
  }
  if (num % 100 >= 11 && num % 100 <= 13) {
    return "<span>" + num + "th</span>";
  }
  if (num % 10 == 1) {
    return "<span>" + num + "st</span>";
  }
  if (num % 10 == 2) {
    return "<span>" + num + "nd</span>";
  }
  if (num % 10 == 3) {
    return "<span>" + num + "rd</span>";
  }
  return "<span>" + num + "th</span>";
}

function format(num) {
  var number = [];
  var str = "￥";
  if (num < 0) {
    str += "-";
    num *= -1;
  } else if (!(num >= 0)) {
    return "没有数据";
  }
  var digit = parseFloat(num) - parseInt(num);
  num = parseInt(num);
  while (num > 0) {
    var part = num % 1000;
    num = parseInt(num / 1000);
    number.push(part);
  }
  for (var i = number.length - 1; i >= 0; i--) {
    str += number[i];
    if (i != 0) {
      str += ',';
    }
  }
  if (digit > 0) {
    str += digit.toString().substring(1, 4);
  }
  return str;
}

function onSelect() {
  param = ($("input[name='optionsRadiosinline']:checked").val());
  d3.select("#analyze_2").selectAll("rect").remove();
  layout(true);
}

function enter(str, limit) {
  char = str.split('');
  str = "";
  for (var i = 0; i < char.length; i++) {
    str += char[i];
    if (i > 0 && i < char.length - 2 && (i + 1) % limit == 0) {
      str += '\n';
    }
  }
  return str;
}