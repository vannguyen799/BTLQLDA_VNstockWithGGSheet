//lay du lieu danh sach ma chung khoan
function stockListCrawl() {
    //var resp = UrlFetchApp.fetch("https://fiin-core.ssi.com.vn/Master/GetListOrganization?language=en");
    //var resp = UrlFetchApp.fetch("https://iboard.ssi.com.vn/dchart/api/1.1/defaultAllStocks");
    var resp = UrlFetchApp.fetch("https://raw.githubusercontent.com/Hieule02/QLDACNTT_N5/main/data/stockList.json");
    return JSON.parse(resp);
}


function stockListBy_icbCode(icbCode)
{
    var stocklist = stockListCrawl();
    let r = new Array();
    let companyList = new Array();
    let tickerList = new Array();
    
    for (var i = 0; i < stocklist.totalCount; i++) {
      var t = stocklist.items[i].icbCode - icbCode;
        if ( t< 1000 && t>=0) {
            tickerList.push(stocklist.items[i].ticker);
            companyList.push(stocklist.items[i].organShortName);
        }
    }
    r.push(tickerList);
    r.push(companyList);
    return r;

}
function stockListByEx(exchange) {
    var comGroupCode;
    if (exchange == "UPCOM") comGroupCode = "UpcomIndex";
    else if (exchange == "HOSE") comGroupCode = "VNINDEX";
    else if (exchange == "HNX") comGroupCode = "HNXIndex";
    else return;

    var stocklist = stockListCrawl();
    let r = new Array();
    let companyList = new Array();
    let tickerList = new Array();

    for (var i = 0; i < stocklist.totalCount; i++) {
        if (stocklist.items[i].comGroupCode == comGroupCode) {
            tickerList.push(stocklist.items[i].ticker);
            companyList.push(stocklist.items[i].organShortName);
        }
    }
    r.push(tickerList);
    r.push(companyList);
    return r;
}

//lay du lieu theo ma chung khoan
function stockRealtimeCrawl(symbol) {
    var resp = UrlFetchApp.fetch("https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/second-tc-price?tickers=" + symbol);
    return JSON.parse(resp);
}

function stockHistoryCrawl(symbol, type, timeStart, timeEnd) {
    var resp = UrlFetchApp.fetch("https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/bars-long-term?ticker=" + symbol +
        "&type="+ type +"&resolution=D&from=" + timeStart + "&to=" + timeEnd);
    return JSON.parse(resp);
}

//lay thong tin cong ty
function stockTickerOverview(symbol) {
    var resp = UrlFetchApp.fetch("https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/" + symbol + "/overview");
    return JSON.parse(resp);
}

