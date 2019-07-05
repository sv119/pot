/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-04 14:33:05 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-05 18:18:57
 */

(function () {
    // 资产负债表信息
    Balance = (function () {
        function Balance(info) {
            this.Code = info.SECURITY_CODE; // 证券代码
            this.Name = info.SECURITY_NAME; // 证券简称
            this.Type = dict[info.SECURITY_CODE]; // 管理分类
            this.CurrentAssets = info.BAME00840M; // 流动资产
            this.FixedAssets = info.BAME01320M; // 固定资产
            this.OtherAssets = info.BAME01330M; // 其他资产
            this.TotalAssets = info.BAME01340M; // 资产总计
            this.CurrentLiability = info.BAME01980M; // 流动负债
            this.FixedLiability = info.BAME02190M; // 固定负债
            this.OtherLiability = info.BAME02200M; // 其他负债
            this.TotalLiability = info.BAME02210M; // 负债总计
            this.TotalEquity = info.BAME02470M; // 所有者权益总计
            this.TotalLiability_Equity = info.BAME02480M; // 负债和所有者权益总计
        }
        return Balance;
    })();
    window.Balance = Balance;

    // 利润表信息
    Income = (function () {
        function Income(info) {
            this.Code = info.SECURITY_CODE; // 证券代码
            this.Name = info.SECURITY_NAME; // 证券简称
            this.Type = dict[info.SECURITY_CODE]; // 管理分类
            this.TotalRevenue = info.PRME00010M; // 营业总收入
            this.TotalCost = info.PRME00500M; // 营业总成本
            this.OperationProfit = info.PRME0940M; // 营业利润
            this.ProfitBeforeTax = info.PRME1050M; // 利润总额
            this.NetProfit = info.PRME01080M; // 净利润
            this.ProfitAvailable = info.PRME01170M; // 税后总额
            this.TotalIncome = info.PRME01330M; // 综合收益总额
            this.ShareRepurchase = info.PRME01370M; // 每股收益
        }
        return Income;
    })();
    window.Income = Income;

    // 现金流信息
    CashFlow = (function () {
        function CashFlow(info) {
            this.Code = info.SECURITY_CODE; // 证券代码
            this.Name = info.SECURITY_NAME; // 证券简称
            this.Type = dict[info.SECURITY_CODE]; // 管理分类
            this.FromOperation = info.CFME01210M; // 经营活动产生的现金流量净额
            this.FromInvestment = info.CFME01610M; // 投资活动产生的现金流量净额
            this.FromFund = info.CFME2060M; // 筹资活动产生的现金流量净额
        }
        return CashFlow;
    })();
    window.CashFlow = CashFlow;
})();

// 分类表
var dict = {};

function LoadClassInfo(info) {
    for (let i = 0; i < info.length; i++) {
        dict[info[i].CODE] = {
            CLASS_1: info[i].CLASS_1,
            TYPE_1: info[i].TYPE_1,
            CLASS_2: info[i].CLASS_2,
            TYPE_2: info[i].TYPE_2,
            CLASS_3: info[i].CLASS_3,
            TYPE_3: info[i].TYPE_3
        };
    }
}