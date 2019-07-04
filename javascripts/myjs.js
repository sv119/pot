/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-04 10:56:05 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-04 11:42:11
 */

var dataset = {
  "BalanceSheet": [],
  "IncomeStatement": [],
  "CashFlowStatement": []
};

var SRC = {
  "BalanceSheet": "src/BalanceSheet.csv",
  "IncomeStatement": "src/IncomeStatement.csv",
  "CashFlowStatement": "src/CashFlowStatement.csv"
};

(function load() {
  var csv = d3.dsv(",", "text/csv;charset=gb2312");
  csv(SRC.BalanceSheet, function (data) {
    dataset.BalanceSheet = data;
    csv(SRC.IncomeStatement, function (data) {
      dataset.IncomeStatement = data;
      csv(SRC.CashFlowStatement, function (data) {
        dataset.CashFlowStatement = data;
        init();
      })
    })
  });
})()

function init() {
  console.log(dataset);
}
