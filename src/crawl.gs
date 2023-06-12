//lay du lieu danh sach ma chung khoan
function stockListCrawl() {
    //var resp = UrlFetchApp.fetch("https://fiin-core.ssi.com.vn/Master/GetListOrganization?language=en");
    //var resp = UrlFetchApp.fetch("https://iboard.ssi.com.vn/dchart/api/1.1/defaultAllStocks");
    var resp = UrlFetchApp.fetch("https://raw.githubusercontent.com/vannguyen799/BTLQLDA_VNstockWithGGSheet/main/src/data/stockList.json");
    return JSON.parse(resp);
}

function stockListBy_icbCode(icbCode) {
    var stocklist = stockListCrawl();
    let r = new Array();
    let companyList = new Array();
    let tickerList = new Array();

    for (var i = 0; i < stocklist.totalCount; i++) {
        var t = stocklist.items[i].icbCode - icbCode;
        if (t < 1000 && t >= 0) {
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
    //timeStart = Date.parse(timeStart);
    //timeEnd = Date.parse(timeEnd);
    timeStart = parseInt(timeStart / 1000);
    timeEnd = parseInt(timeEnd / 1000);
    
    var resp = UrlFetchApp.fetch("https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/bars-long-term?ticker=" + symbol +
        "&type=" + type + "&resolution=D&from=" + timeStart + "&to=" + timeEnd);
        Logger.log("https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/bars-long-term?ticker=" + symbol +
        "&type=" + type + "&resolution=D&from=" + timeStart + "&to=" + timeEnd);
    return JSON.parse(resp).data;
}

function stockHistoryCrawl_global(symbol, dateStart, dateEnd) {
    var apiKey = "iRe_0PXMLJQ7b4zBJkspMPphYYQFprUZ";
    dateStart = new Date(dateStart);
    dateEnd = new Date(dateEnd);
    var start = dateStart.toISOString().split('T')[0];
    var end = dateEnd.toISOString().split('T')[0];
    var resp = UrlFetchApp.fetch("https://api.polygon.io/v2/aggs/ticker/" + symbol +
        "/range/1/day/" + start + "/" + end + "?apiKey=" + apiKey);

    data = JSON.parse(resp).results;
    for (var i = 0; i < data.length; i++) {
        data[i].close = data[i].c;
        data[i].high = data[i].h;
        data[i].low = data[i].l;
        data[i].open = data[i].o;
        data[i].t = new Date(data[i].t).toISOString().split('T')[0];
        data[i].tradingDate = data[i].t;
        data[i].volume = data[i].v;
    }
    return data;
}

function stockHistoryCrawl_fx(symbol, dateStart, dateEnd) {
    var apiKey = "iRe_0PXMLJQ7b4zBJkspMPphYYQFprUZ";
    dateStart = new Date(dateStart);
    dateEnd = new Date(dateEnd);
    var start = dateStart.toISOString().split('T')[0];
    var end = dateEnd.toISOString().split('T')[0];
    var resp = UrlFetchApp.fetch("https://api.polygon.io/v2/aggs/ticker/C:" + symbol +
        "/range/1/day/" + start + "/" + end + "?apiKey=" + apiKey);

    data = JSON.parse(resp).results;
    for (var i = 0; i < data.length; i++) {
        data[i].close = data[i].c;
        data[i].high = data[i].h;
        data[i].low = data[i].l;
        data[i].open = data[i].o;
        data[i].t = new Date(data[i].t).toISOString().split('T')[0];
        data[i].tradingDate = data[i].t;
        data[i].volume = data[i].v;
    }
    return data;
}

//lay thong tin cong ty
function stockTickerOverview(symbol) {
    var resp = UrlFetchApp.fetch("https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/" + symbol + "/overview");
    return JSON.parse(resp);
}


function stockTickerOverview_global(symbol) {
    var apiKey = "iRe_0PXMLJQ7b4zBJkspMPphYYQFprUZ";
    var resp = UrlFetchApp.fetch("https://api.polygon.io/v3/reference/tickers/" + symbol + "?apiKey=" + apiKey);
    var data = JSON.parse(resp).results;
    return {
        "shortName": data.name,
        "exchange": data.primary_exchange,
        "establishedYear": data.list_date,
        "website": data.homepage_url,
        "stockRating": ""
    };
}

function stockTickerOverview_fx(symbol) {
    var apiKey = "iRe_0PXMLJQ7b4zBJkspMPphYYQFprUZ";
    var resp = UrlFetchApp.fetch("https://api.polygon.io/v3/reference/tickers/" + symbol + "?apiKey=" + apiKey);
    var data = JSON.parse(resp).results;
    return {
        "shortName": data.name,
        "exchange": data.primary_exchange,
        "establishedYear": data.list_date,
        "website": data.homepage_url,
        "stockRating": ""
    };
}

function stockTickerOverview_fx(symbol) {
    var apiKey = "iRe_0PXMLJQ7b4zBJkspMPphYYQFprUZ";
    var resp = UrlFetchApp.fetch("https://api.polygon.io/v3/reference/tickers?ticker=C:" + symbol + "&active=true&apiKey=" + apiKey);
    var data = JSON.parse(resp).results;
    return {
        "shortName": data.name,
        "exchange": data.market,
        "establishedYear": "",
        "website": "",
        "stockRating": ""
    };

}
