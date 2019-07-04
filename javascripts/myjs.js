/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-04 10:56:05 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-04 16:14:38
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
  CashFlowStatement: "src/CashFlowStatement.csv"
};

(function load() {
  var csv = d3.dsv(",", "text/csv;charset=gb2312");
  csv(SRC.BalanceSheet, function (data) {
    Sheets.BalanceSheet = data;
    for (var i = 0; i < data.length; i++) {
      var year = (data[i].DATA_YEAR).toString().substring(0, 4);
      var ctx = "undefined";
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
      dataset[year][ctx].Balance.push(new Balance(data[i]));
    }
    csv(SRC.IncomeStatement, function (data) {
      Sheets.IncomeStatement = data;
      for (var i = 0; i < data.length; i++) {
        var year = (data[i].DATA_YEAR).toString().substring(0, 4);
        var ctx = "undefined";
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
        dataset[year][ctx].Income.push(new Income(data[i]));
      }
      csv(SRC.CashFlowStatement, function (data) {
        Sheets.CashFlowStatement = data;
        for (var i = 0; i < data.length; i++) {
          var year = (data[i].DATA_YEAR).toString().substring(0, 4);
          var ctx = "undefined";
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
          dataset[year][ctx].CashFlow.push(new CashFlow(data[i]));
        }
        init();
      })
    })
  });
})()

function init() {
  console.log(dataset);
}