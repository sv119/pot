/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-04 10:56:05 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-07-05 19:13:55
 */

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
  Rule: "src/rule.csv"
};

var yearset = [];

(function load() {
  var csv = d3.dsv(",", "text/csv;charset=gb2312");
  csv(SRC.Rule, function (data) {
    LoadClassInfo(data);
    csv(SRC.BalanceSheet, function (data) {
      Sheets.BalanceSheet = data;
      for (let i = 0; i < data.length; i++) {
        let year = (data[i].DATA_YEAR).toString().substring(0, 4);
        for (var y = 0; y <= yearset.length; y++) {
          if (y == yearset.length) {
            yearset.push(year);
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
})()

function init() {
  // console.log(dataset);
  $("input[name=Code]").val("");
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
  paint(objset, prtset);
}

function paint(dataObj, prtset) {
  if (prtset == void 0)
    prtset = [];
  if (dataObj.length == 0 && prtset.length == 0) {
    var myChart = echarts.init(document.getElementById('chart'), 'dark');
    var app = {};
    app.title = "没有数据";

    let year = [" - "];

    var option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      title: {
        text: '没有数据',
        left: 'center',
        top: 10
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

  var myChart = echarts.init(document.getElementById('chart'), 'dark');
  var app = {};
  app.title = dataObj[0].Name;

  let data = [];
  for (let i = 0; i < 12; i++) {
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
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      title: {
        text: dataObj[0].Name,
        subtext: dataObj[0].Type.TYPE_1 + "/" + dataObj[0].Type.TYPE_2 + "/" + dataObj[0].Type.TYPE_3,
        left: 'center',
        top: 10
      },
      legend: {
        data: ['资产总计（母公司）', '流动资产（母公司）', '固定资产（母公司）', '负债总计（母公司）', '流动负债（母公司）', '固定负债（母公司）',
          '资产总计（合并）', '流动资产（合并）', '固定资产（合并）', '负债总计（合并）', '流动负债（合并）', '固定负债（合并）'
        ],
        orient: "vertical",
        left: "right"
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
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      title: {
        text: dataObj[0].Name,
        subtext: dataObj[0].Type.TYPE_1 + "/" + dataObj[0].Type.TYPE_2 + "/" + dataObj[0].Type.TYPE_3,
        left: 'center',
        top: 10
      },
      legend: {
        data: ['资产总计', '流动资产', '固定资产', '负债总计', '流动负债', '固定负债'],
        orient: "vertical",
        left: "right"
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
      }]
    };
  }

  if (option && typeof option === "object") {
    myChart.setOption(option, true);
  }
}

paint([]);