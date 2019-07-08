/*
 * @Author: Antoine YANG 
 * @Date: 2019-07-04 14:33:05 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-07-08 19:30:31
 */

(function () {
    // 资产负债表信息
    Balance = (function () {
        function Balance(info) {
            this.Code = info.SECURITY_CODE; // 证券代码
            this.Name = info.SECURITY_NAME; // 证券简称
            this.Type = dict[info.SECURITY_CODE]; // 管理分类
            this.CurrentAssets = info.BAME00840M > 0 ? info.BAME00840M : 0; // 流动资产
            this.ValidAssets = asure(info.BAME00840M) -
                asure(info.BAME00650M) - asure(info.BAME00310M) - asure(info.BAME00320M) - asure(info.BAME00330M); // 速动资产
            this.CheckAssets = asure(info.BAME00030M) + asure(info.BAME00570M) + asure(info.BAME00600M) + asure(info.BAME00160M) +
                asure(info.BAME00170M) + asure(info.BAME00180M) + asure(info.BAME00190M) +
                asure(info.BAME00200M) + asure(info.BAME00210M); // 货币资金
            this.ToCheckIn = asure(info.BAME00250M); // 应收账款
            this.Repo = asure(info.BAME00650M); // 存货
            this.FixedAssets = info.BAME01320M > 0 ? info.BAME01320M : 0; // 固定资产
            this.OtherAssets = info.BAME01330M > 0 ? info.BAME01330M : 0; // 其他资产
            this.TotalAssets = info.BAME01340M > 0 ? info.BAME01340M : 0; // 资产总计
            this.CurrentLiability = info.BAME01980M > 0 ? info.BAME01980M : 0; // 流动负债
            this.FixedLiability = info.BAME02190M > 0 ? info.BAME02190M : 0; // 固定负债
            this.OtherLiability = info.BAME02200M > 0 ? info.BAME02200M : 0; // 其他负债
            this.TotalLiability = info.BAME02210M > 0 ? info.BAME02210M : 0; // 负债总计
            this.TotalEquity = info.BAME02470M > 0 ? info.BAME02470M : 0; // 所有者权益总计
            this.TotalLiability_Equity = info.BAME02480M > 0 ? info.BAME02480M : 0; // 负债和所有者权益总计
            this.Income = null;
            this.CashFlow = null;
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
var Class = [];

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
        let i_1 = 0,
            i_2 = 0,
            i_3 = 0;
        for (i_1 = 0; i_1 <= Class.length; i_1++) {
            if (i_1 == Class.length) {
                Class.push({
                    name: info[i].TYPE_1,
                    children: []
                });
                break;
            }
            if (Class[i_1].name == info[i].TYPE_1)
                break;
        }
        for (i_2 = 0; i_2 <= Class[i_1].children.length; i_2++) {
            if (i_2 == Class[i_1].children.length) {
                Class[i_1].children.push({
                    name: info[i].TYPE_2,
                    children: []
                });
                break;
            }
            if (Class[i_1].children[i_2].name == info[i].TYPE_2)
                break;
        }
        for (i_3 = 0; i_3 <= Class[i_1].children[i_2].children.length; i_3++) {
            if (i_3 == Class[i_1].children[i_2].children.length) {
                Class[i_1].children[i_2].children.push({
                    name: info[i].TYPE_3,
                    children: []
                });
                break;
            }
            if (Class[i_1].children[i_2].children[i_3].name == info[i].TYPE_3)
                break;
        }
        for (i_4 = 0; i_4 <= Class[i_1].children[i_2].children[i_3].children.length; i_4++) {
            if (i_4 == Class[i_1].children[i_2].children[i_3].children.length) {
                Class[i_1].children[i_2].children[i_3].children.push({
                    name: info[i].NAME + " (" + info[i].CODE + ")"
                });
                break;
            }
            if (Class[i_1].children[i_2].children[i_3].children[i_4].name == info[i].TYPE_3)
                break;
        }
    }
}

// 翻译字段名
var nameof = {};

function LoadDictionary(info) {
    for (let i = 0; i < info.length; i++) {
        nameof[info[i].Var] = info[i].Name;
    }
}

function asure(n) {
    return n > 0 ? parseInt(n) : 0;
}