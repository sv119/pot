/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-04 10:56:05 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-14 18:42:55
 */

var colorset = {
  sunset: ['#00BFFF', '#1E90FF', '#6495ED', '#4169E1', '#87CEFA']
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
              .html('<img src="../images/ico04.ico" style="width:16px;height:16px;float:left;margin-left:3px; ">')
              .append("a")
              .attr("href", "javascript: void(0);")
              .style("color","#00BFFF")
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
  dataview(objset);
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
      color: colorset.sunset,
      // border: "1px solid white",
      // stroke: "none",
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
    if (val >= all / 4) {
      var child = {
        label: enter(nameof[para + spaner + "0M"], 5),
        value: val
      };
      data[0]['children'][0]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }

  // 非流动资产
  all = parseInt(d["BAME01320M"]);
  others = 0;
  para = "BAME0";
  for (var num = 86; num <= 131; num++) {
    var spaner = num < 100 ? "0" + num : num;
    if (nameof[para + spaner + "0M"].indexOf("其中：") != -1)
      continue;
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 4) {
      var child = {
        label: enter(nameof[para + spaner + "0M"], 5),
        value: val
      };
      data[0]['children'][1]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }

  // 流动负债
  all = parseInt(d["BAME01980M"]);
  others = 0;
  para = "BAME0";
  for (var num = 137; num <= 197; num++) {
    var spaner = num.toString();
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 4) {
      var child = {
        label: enter(nameof[para + spaner + "0M"], 5),
        value: val
      };
      data[1]['children'][0]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }

  // 非流动负债
  all = parseInt(d["BAME02190M"]);
  others = 0;
  para = "BAME0";
  for (var num = 200; num <= 218; num++) {
    var spaner = num.toString();
    if (nameof[para + spaner + "0M"].indexOf("其中：") != -1)
      continue;
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 4) {
      var child = {
        label: enter(nameof[para + spaner + "0M"], 5),
        value: val
      };
      data[1]['children'][1]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }

  // 所有者权益总计
  all = parseInt(d["BAME02470M"]);
  others = 0;
  para = "BAME0";
  for (var num = 223; num <= 246; num++) {
    var spaner = num.toString();
    if (nameof[para + spaner + "0M"].indexOf("其中：") != -1)
      continue;
    var val = parseInt(d[para + spaner + "0M"]);
    if (val >= all / 4) {
      var child = {
        label: enter(nameof[para + spaner + "0M"], 5),
        value: val
      };
      data[2]['children'][0]['children'].push(child);
    } else if (val > 0) {
      others += val;
    }
  }

  var option = {
    margin: 20,
    color: colorset.sunset,
    // border: "1px solid white",
    // animation: 1000,
    data: [{
      label: "企业画像",
      value: '',
      children: data,
    }],
    max: 3
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
      .html('<img src="../images/ico04.ico" style="width:16px;height:16px;float:left;margin-left:0px;"></img><span><i class="icon-folder-open"></i>' + Class[i_1].name + '</span>')
      .append("ul")
      .style("padding-left", "25px")
      .style("margin-top","2px");
    for (let i_2 = 0; i_2 < Class[i_1].children.length; i_2++) {
      var c_2 = c_1.append("li")
        .style("display", "none")
        .html('<img src="../images/ico04.ico" style="width:16px;height:16px;float:left;margin-left:3px;"></img><span><i class="icon-minus-sign"></i>' + Class[i_1].children[i_2].name + '</span>')
        .append("ul")
        .style("padding-left", "25px");
      for (let i_3 = 0; i_3 < Class[i_1].children[i_2].children.length; i_3++) {
        var c_3 = c_2.append("li")
          .style("display", "none")
          .html('<img src="../images/ico04.ico" style="width:16px;height:16px;float:left;margin-left:3px;"></img><span><i class="icon-minus-sign"></i>' +
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
            .html('<img src="../images/ico04.ico" style="width:16px;height:16px;float:left;margin-left:1px;"></img><i class="icon-leaf"></i>' +
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

// 散点图配置项
{
  var mdsData = {};

  d3.select("#mds")
    .append("svg")
    .attr("id", "mdssvg")
    .attr("width", "530px")
    .attr("height", "360px");

  var mdstip = d3.select("body")
    .append("div")
    .attr("id", "point-view")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("opacity", "0.7")
    .style("border", "solid");
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
        if (data[i][2] == void 0 || data[i][3] == void 0)
          continue;
        data1.push([c[i], d[i], data[i][2], data[i][3]]);
      }

      svg.selectAll("circle")
        .data(data1)
        .attr("cx", function (d) {
          return d[0] * 0.8 + 60;
        })
        .attr("cy", function (d) {
          return d[1] * 0.8 + 10;
        })
        .attr("opacity", "0.6");

      svg.selectAll("circle")
        .data(data1)
        .enter()
        .append("circle")
        .attr("class","circled")
        .attr("cx", function (d) {
          return d[0] * 0.8 + 60;
        })
        .attr("cy", function (d) {
          return d[1] * 0.8 + 10;
        })
        .attr("r", 6)
        .attr("opacity", "0.6")
        .attr("fill", function (d) {
          //console.log(d[3], $("input[name=Code]").val());
          return d[3] == $("input[name=Code]").val() ? "#FFFAF0" : "#00BFFF";
        })
        .on("mouseover", function (d) {
          // alert((parseInt(d3.event.pageX)+10)+'px, ' + (parseInt(d3.event.pageY)-10)+'px');
          d3.select(this).attr("fill", "#FFFAF0").attr("r", 10).attr("opacity", "1");
          mdstip.html(d[2] + d[3]);
          mdstip.style("visibility", "visible");
        })
        .on('mousemove', function () {
          mdstip.style('top', (parseInt(d3.event.pageY) - 10) + 'px').style('left', (parseInt(d3.event.pageX) + 10) + 'px')
        })
        .on("mouseout", function () {
          d3.select(this)
            .attr("fill", "#00BFFF")
            .attr("r", 6)
            .attr("opacity", "0.6");
          mdstip.style("visibility", "hidden");
        })
        .on('click', function (d) {
          $("input[name=Code]").val(d[3]);
          draw();
          d3.select(this)
            .attr("fill", "#FFFAF0")
            .attr("r", 10)
            .attr("opacity", "1");
        });

      svg.selectAll("circle")
        .data(data1)
        .exit()
        .transition()
        .duration(600)
        .attr("opacity", "0")
        .attr("r", 0)
        .each("end", function() {
          d3.select(this).remove();
        });
    });
    return;
  }  

  // label = mdsData[y][ctx].label;
  // data = mdsData[y][ctx].data;
  // console.log(label)
}

// 柱状图配置项
{
  var width = parseInt(d3.select("#analyze_2").style("width")) - 4;
  var height = parseInt(d3.select("#analyze_2").style("height")) / 4 - 8;
  var padding = {
    top: 24,
    right: 20,
    bottom: 4,
    left: 20
  };
  var svg = [null, null, null, null];

  var yScale = [null, null, null, null];
  var trans = [0, 0, 0, 0];
  var columnAt = [0, 0, 0, 0];

  var animation = 400;

  var color = {
    init: colorset.sunset[3],
    in: colorset.sunset[0]
  };

  var _data = [];

  var max = [0, 0, 0, 0];
  var min = [0, 0, 0, 0];
  var average = [0, 0, 0, 0];

  var rectStep = 10 * parseInt(width) / _data.length;
  var rectWidth = rectStep * 0.6;

  var param = ["TotalAssets", "TotalLiability", "TotalEquity", "TotalLiability_Equity"];

  var tooltip = d3.select("body")
    .append("div")
    .classed("dragtip", true)
    .style("opacity", 0.0)
    .style("position", "absolute");
}

function layout(ensure) {
  for (let li = 0; li < 2; li++) {
    d3.select("#ranking" + li).selectAll("rect").attr("fill", color.in);
    d3.select("#column" + li + "-" + $("input[name=Code]").val()).attr("fill", "white");

    let highlighted = d3.select("#column" + li + "-" + $("input[name=Code]").val());

    try {
      let center = parseInt(width) / 2 - (padding.left + padding.right) / 2;
      let start = parseFloat(highlighted.attr("x")) + parseFloat(highlighted.attr("transform").substring(10, highlighted.attr("transform").indexOf(',')));
      let dx = center - start - rectWidth;
      trans[li] += dx;
      trans[li] = trans[li] > 0 ? 0 : trans[li];

      for (let i = 0; i < _data.length; i++) {
        if (_data[i].Code == $("input[name=Code]").val()) {
          columnAt[li] = i;
          break;
        }
      }
      let begin = columnAt[li] < 10 ? 0 : columnAt[li] - 10;
      let _max = parseInt(_data[begin][param[li]]);
      for (let i = begin + 1; i < _data.length && i < begin + 21; i++) {
        _data[i].index = i;
        if (parseInt(_data[i][param[li]]) > _max) {
          _max = parseInt(_data[i][param[li]]);
        }
      }
      _max = _max > 0 ? _max * 1.1 : _max * 0.9;
      yScale[li] = d3.scale.linear()
        .domain([min[li], _max])
        .range([0, parseInt(height) - padding.top - padding.bottom]);

      if (_max < max[li]) {
        d3.select("#ranking" + li)
          .selectAll("rect")
          .data(_data)
          .transition()
          .delay(animation)
          .duration(animation)
          .attr("transform", "translate(" + trans[li] + ",0)")
          .attr("fill", function (d) {
            return (d.Code == $("input[name=Code]").val()) ? "white" : color.in;
          })
          .style("opacity", 0.7)
          .attr("width", rectWidth);

        d3.select("#ranking" + li)
          .selectAll("rect")
          .data(_data)
          .transition()
          .delay(2.1 * animation)
          .duration(animation)
          .attr("y", function (d) {
            return parseInt(height) - padding.bottom - yScale[li](parseInt(d[param[li]]));
          })
          .attr("height", function (d) {
            return yScale[li](parseInt(d[param[li]]));
          })
          .attr("x", function (d, i) {
            return i * rectStep;
          });
      } else {
        d3.select("#ranking" + li)
          .selectAll("rect")
          .data(_data)
          .transition()
          .delay(animation)
          .duration(animation)
          .attr("y", function (d) {
            return parseInt(height) - padding.bottom - yScale[li](parseInt(d[param[li]]));
          })
          .attr("height", function (d) {
            return yScale[li](parseInt(d[param[li]]));
          })
          .attr("x", function (d, i) {
            return i * rectStep;
          });

        d3.select("#ranking" + li)
          .selectAll("rect")
          .data(_data)
          .transition()
          .delay(2.1 * animation)
          .duration(animation)
          .attr("transform", "translate(" + trans[li] + ",0)")
          .attr("fill", function (d) {
            return (d.Code == $("input[name=Code]").val()) ? "white" : color.in;
          })
          .style("opacity", 0.7)
          .attr("width", rectWidth);
      }

      max[li] = _max;
    } catch (error) {}

    if (_data == dataset[incase.year][incase.ctx].Balance && !ensure) {
      return;
    }

    _data = dataset[incase.year][incase.ctx].Balance;

    rectStep = 10 * parseInt(width) / _data.length;
    rectWidth = rectStep * 0.6;

    max[li] = parseInt(_data[0][param[li]]);
    min[li] = parseInt(_data[0][param[li]]);
    average[li] = parseInt(_data[0][param[li]]);

    for (let i = 1; i < _data.length; i++) {
      _data[i].index = i;
      if (parseInt(_data[i][param[li]]) > max[li]) {
        max[li] = parseInt(_data[i][param[li]]);
      }
      if (parseInt(_data[i][param[li]]) < min[li]) {
        min[li] = parseInt(_data[i][param[li]]);
      }
      average[li] += parseInt(_data[i][param[li]]);
    }
    min[li] = min[li] > 0 ? 0 : min[li] * 1.1;
    max[li] = max[li] > 0 ? max[li] * 1.1 : max[li] * 0.9;
    average[li] /= _data.length;

    yScale[li] = d3.scale.linear()
      .domain([min[li], max[li]])
      .range([0, parseInt(height) - padding.top - padding.bottom]);

    for (let i = 0; i < _data.length; i++) {
      let min = _data[0][param[li]];
      let index = 0;
      for (let j = 0; j < _data.length - i; j++) {
        if (parseFloat(_data[j][param[li]]) < min) {
          min = parseFloat(_data[j][param[li]]);
          index = j;
        }
      }
      let temp = _data[_data.length - 1 - i];
      _data[_data.length - 1 - i] = _data[index];
      _data[index] = temp;
    }

    if (d3.select("#analyze_2").html() == "") {
      for (let j = 0; j < 4; j++) {
        svg[j] = d3.select("#analyze_2")
          .append("svg")
          .attr("id", "ranking" + j)
          .attr("width", width - padding.left - padding.right)
          .style("margin-left", padding.left + "px")
          .attr("height", height)
          .attr("version", "1.1")
          .attr("xmlns", "http://www.w3.org/2000/svg");
      }
    } else {
      svg[li] = d3.select("#ranking" + li);
    }

    let rectUpdate = svg[li].selectAll("rect").data(_data);
    let rectEnter = rectUpdate.enter();
    let rectExit = rectUpdate.exit();

    rectUpdate.transition()
      .duration(animation)
      .attr("fill", function (d) {
        return (d.Code == $("input[name=Code]").val()) ? "white" : color.in;
      })
      .style("opacity", 0.7)
      .attr("x", function (d, i) {
        return d.index * rectStep;
      })
      .attr("y", function (d) {
        return parseInt(height) - padding.bottom - yScale[li](parseInt(d[param[li]]));
      })
      .attr("width", rectWidth)
      .attr("height", function (d) {
        return yScale[li](parseInt(d[param[li]]));
      })
      .transition()
      .delay(2000 + 2000 * Math.random())
      .duration(animation + animation * Math.random())
      .attr("x", function (d, i) {
        return i * rectStep;
      });

    rectEnter.append("rect")
      .attr("id", function (d) {
        return "column" + li + "-" + d.Code;
      })
      .attr("fill", color.init)
      .style("opacity", 0.7)
      .attr("x", function (d, i) {
        return d.index * rectStep;
      })
      .attr("transform", "translate(" + trans[li] + ",0)")
      .attr("y", parseInt(height) - padding.bottom - yScale[li](parseInt(average[li])))
      .attr("width", 0)
      .attr("height", yScale[li](average[li]))
      .on("mouseover", function (d, i) {
        d3.select(this)
          .style("opacity", 1);
        tooltip.html(rank(i) + "<br />" + d.Name + " (" + d.Code + ")<br />" + param[li] + ": " + format(d[param[li]]))
          .style("left", (d3.event.pageX + 20) + "px")
          .style("top", (d3.event.pageY + 20) + "px")
          .style("opacity", 1.0);
      })
      .on("mousemove", function (d) {
        tooltip.style("left", (d3.event.pageX + 20) + "px")
          .style("top", (d3.event.pageY + 20) + "px");
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .style("opacity", 0.7);
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
        return parseInt(height) - padding.bottom - yScale[li](parseInt(d[param[li]]));
      })
      .attr("width", rectWidth)
      .attr("height", function (d) {
        return yScale[li](parseInt(d[param[li]]));
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

//dataview
function dataview(d) {
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
    if (year[i] == y) {
      d3.select("#t1").text(function () {
        return d[0]["CashFlow"]["Name"];
      });
      d3.select("#t2").text(function () {
        return d[0]["CashFlow"]["Code"];
      });
      d3.select("#t3").text(function () {
        return data[0][i];
      });
      d3.select("#t4").text(function () {
        return data[1][i];
      });
      d3.select("#t5").text(function () {
        return data[2][i];
      });
      d3.select("#t6").text(function () {
        return data[3][i];
      });
      d3.select("#t7").text(function () {
        return data[4][i];
      });
      d3.select("#t8").text(function () {
        return data[6][i];
      });

    }
  }


}