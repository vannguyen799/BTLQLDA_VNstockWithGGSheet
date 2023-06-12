function menuCustom() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Menu')
        .addItem('Send to Email', "sendResultToEmail")
        .addItem('Reset', "Reset")
        .addItem('onOpen() Call', 'onOpenTrigger')
        .addItem('onOpenPriceChart() Call', 'onOpenPriceChart')
        .addToUi();
}

function listTickerDisplay() {
    Logger.log(arguments.callee.name);
    var exchangeSelectCell = 'C5';
    var Priceboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Priceboard");
    var exchange = Priceboard.getRange(exchangeSelectCell).getValue();
    var status = Priceboard.getRange('C8');
    status.setValue('Updating...').setFontColor('red');
    Priceboard.getRange('D6:I').clearContent();
    SpreadsheetApp.flush();

    if (exchange == 'HNX' || exchange == 'HOSE' || exchange == 'UPCOM') {
        var tickerList = stockListByEx(exchange);
        for (var i = 0; i < tickerList[0].length; i++) {
            Priceboard.getRange('D' + (i + 6)).setValue(tickerList[0][i]);
            Priceboard.getRange('E' + (i + 6)).setValue(tickerList[1][i]);
        }
    } else {
        var icbCode = 0;
        switch (exchange) {
            case "Dầu Khí":
                icbCode = 1;
                break;
            case "Vật Liệu Cơ Bản":
                icbCode = 1000;
                break;
            case "Công Nghiệp":
                icbCode = 2000;
                break;
            case "Hàng Tiêu Dùng":
                icbCode = 3000;
                break;
            case "Y Tế":
                icbCode = 4000;
                break;
            case "Dịch Vụ Tiêu Dùng":
                icbCode = 5000;
                break;
            case "Viễn Thông":
                icbCode = 6000;
                break;
            case "Các Dịch Vụ Hạ Tầng":
                icbCode = 7000;
                break;
            case "Tài Chính":
                icbCode = 8000;
                break;
            case "Công Nghệ":
                icbCode = 9000;
                break;
            default:
                return;
        }
        var tickerList = stockListBy_icbCode(icbCode);
        for (var i = 0; i < tickerList[0].length; i++) {
            Priceboard.getRange('D' + (i + 6)).setValue(tickerList[0][i]);
            Priceboard.getRange('E' + (i + 6)).setValue(tickerList[1][i]);
        }
    }
    status.setValue('Done!').setFontColor("green");
}

function searchTicker() {
    Logger.log(arguments.callee.name);
    var exchangeSelectCell = 'C5';
    var searchCell = 'C7';
    var Priceboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Priceboard");
    var exchange = Priceboard.getRange(exchangeSelectCell).getValue();
    var status = Priceboard.getRange('C8');
    var tickerName = Priceboard.getRange(searchCell).getValue();
    tickerName = tickerName.toUpperCase();

    status.setValue('Dang tim kiem...').setFontColor('red');
    Priceboard.getRange('D6:I').clearContent();
    SpreadsheetApp.flush();

    var tickerList = stockListByEx(exchange);
    var count = 0;
    for (var i = 0; i < tickerList[0].length; i++) {
        if (tickerList[0][i].includes(tickerName)) {
            Priceboard.getRange('D' + (count + 6)).setValue(tickerList[0][i]);
            Priceboard.getRange('E' + (count + 6)).setValue(tickerList[1][i]);
            count++;
        }
    }
    if (Priceboard.getRange('D' + (6)).getValue() == '') status.setValue('Khong tim thay!').setFontColor("red");
    else status.setValue('Done').setFontColor("green");
}

function getTickerList(sheet, from, to) {
    Logger.log(arguments.callee.name);
    var Priceboard = sheet;
    let tickerList = [];
    var j = 0;
    for (var i = from; i < to; i++) {
        tickerList[j] = Priceboard.getRange('D' + i).getValue();
        if (tickerList[j] == '') break;
        j++;
    }
    return tickerList;
}

function realtimePriceUpdate(sheet, type) {
    Logger.log(arguments.callee.name);
    var Priceboard = sheet;
    var price, thamchieu, p;
    var range = 6;
    for (var k = 1; k <= 20; k++) {
        var from = range;
        var to = range + 50;
        Utilities.sleep(2000);
        var tickerList = getTickerList(Priceboard, from, to);

        console.log(tickerList.length + "from range D " + from + " -> " + to + ": updating " + tickerList);
        if (tickerList[0] == '') return;
        let realtimePrice = stockRealtimeCrawl(tickerList);
        var i = 0;

        while (range < to) {
            var curtype = Priceboard.getRange("C5").getValue();
            if (curtype != type) return;
            if (tickerList[i] == '') return;

            var tickerRange = Priceboard.getRange('D' + range).getValue();
            if (tickerRange != tickerList[i]) return;
            if (realtimePrice.data[i].cp == '' || realtimePrice.data[i].cp == null || realtimePrice.data[i].cp == 0) {
                range++;
                i++;
                continue;
            }
            price = parseInt(realtimePrice.data[i].cp);
            thamchieu = parseInt(realtimePrice.data[i].hmp);
            p = (price - thamchieu) * (100 / thamchieu);
            var x = parseInt(Priceboard.getRange('F' + range).getValue());
            if (price == x) {
                range++;
                i++;
                continue;
            } else if (price > x) Priceboard.getRange('F' + range + ':I' + range).setBackgroundRGB(255, 0, 0);
            else Priceboard.getRange('F' + range + ':I' + range).setBackgroundRGB(50, 205, 50);
            SpreadsheetApp.flush();

            Priceboard.getRange('F' + range).setValue(price);
            Priceboard.getRange('G' + range).setValue(price - thamchieu);
            Priceboard.getRange('H' + range).setValue(p.toFixed(2) + '%');
            Priceboard.getRange('I' + range).setValue(thamchieu);
            Priceboard.getRange('F' + range + ':I' + range).setBackgroundRGB(255, 255, 255);
            range++;
            i++;
        }
    }
}

function updateHistoricalData(region) {
    Logger.log(arguments.callee.name);
    var PriceChart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PriceChart");
    PriceChart.getRange("D25:J").clearContent();
    PriceChart.getRange("M25:S").clearContent();
    PriceChart.getRange("X25:X62").clearContent();
    PriceChart.getRange("J23").setValue("Loading...").setFontColor("red");
    SpreadsheetApp.flush();

    var endDate = Date.parse(PriceChart.getRange("I23").getValue());
    var startDate = Date.parse(PriceChart.getRange("G23").getValue());
    var data;
    var tickerName = PriceChart.getRange('B4').getValue();
    tickerName = tickerName.toUpperCase();
    try {
    if (region == "Vietnam Stock") {
        var type;
        var indexList = ["VNINDEX", "HNXINDEX", "UPCOM", "VN30", "HNX30"];
        if (indexList.includes(tickerName)) type = "index";
        else type = "stock";
        data = stockHistoryCrawl(tickerName, type, startDate, endDate);
    } else if (region == "Global Stock") data = stockHistoryCrawl_global(tickerName, startDate, endDate);
    else if (region == "FOREX") data = stockHistoryCrawl_fx(tickerName, startDate, endDate);
}
catch (e) {PriceChart.getRange("J23").setValue("Error!").setFontColor("red"); return;}
    for (var j = data.length - 1; j > 0; j--) {
        var i = data.length - 1 - j;
        var change = (data[j].close - data[j].open) * 100 / data[j].open;
        PriceChart.getRange('D' + (25 + i)).setValue(data[j].tradingDate.substring(0, 10));
        PriceChart.getRange('E' + (25 + i)).setValue(data[j].open);
        PriceChart.getRange('F' + (25 + i)).setValue(data[j].high);
        PriceChart.getRange('G' + (25 + i)).setValue(data[j].low);
        PriceChart.getRange('H' + (25 + i)).setValue(data[j].close);
        PriceChart.getRange('I' + (25 + i)).setValue(data[j].volume);
        PriceChart.getRange('J' + (25 + i)).setValue(change.toFixed(2) + "%");
    }
    PriceChart.getRange("J23").setValue("Success!").setFontColor("green");
    SpreadsheetApp.flush();

    pricePredict(data.slice(data.length - 7, data.length));
}

function pricePredict(data) {
    Logger.log(arguments.callee.name);
    var PriceChart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PriceChart");
    for (var j = 0; j < 7; j++) {
        var i = j;
        var change = (data[j].close - data[j].open) * 100 / data[j].open;
        PriceChart.getRange('M' + (25 + i)).setValue(data[j].tradingDate.substring(0, 10));
        PriceChart.getRange('N' + (25 + i)).setValue(data[j].open);
        PriceChart.getRange('O' + (25 + i)).setValue(data[j].high);
        PriceChart.getRange('P' + (25 + i)).setValue(data[j].low);
        PriceChart.getRange('Q' + (25 + i)).setValue(data[j].close);
        PriceChart.getRange('R' + (25 + i)).setValue(data[j].volume);
        PriceChart.getRange('S' + (25 + i)).setValue(change.toFixed(2) + "%");
    }

    var day = new Date(PriceChart.getRange("M31").getValue());
    for (var i = 0; i < 30; i++) {
        day.setDate(day.getDate() + 1);
        if (day.getDay() == 0 || day.getDay() == 6) {
            i--;
            continue;
        }
        PriceChart.getRange('M' + (32 + i)).setValue(day.toISOString().split('T')[0]);
    }

    var price = getPredict();
    PriceChart.getRange("X31").setValue(data[6].close);
    try {
        var fix = data[6].close.toString().split('.')[1].length;
    } catch (e) {
        var fix = 0
    };
    for (var i = 0; i < 30; i++) {
        var j = -2 - i;
        PriceChart.getRange('Q' + (32 + i)).setValue(price.Prediction[j].toFixed(fix).toString().replace(".", ","));
        PriceChart.getRange('X' + (32 + i)).setValue(price.Prediction[j].toFixed(fix).toString().replace(".", ","));
    }
}

function getPredict() {
    Logger.log(arguments.callee.name);
    var resp = UrlFetchApp.fetch("https://app001.herokuapp.com/predict");
    return JSON.parse(resp);
}

function updateTickerOverview(region) {
    Logger.log(arguments.callee.name);
    var PriceChart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PriceChart");
    PriceChart.getRange("B6:B11").clearContent();
    var tickerName = PriceChart.getRange('B4').getValue();
    tickerName = tickerName.toUpperCase();
    var data;
    try {
    if (region == "Vietnam Stock") {
        PriceChart.getRange('A9').setValue("Năm thành lập");
        data = stockTickerOverview(tickerName);
    } else if (region == "Global Stock") {
        PriceChart.getRange('A9').setValue("Listing date");
        data = stockTickerOverview_global(tickerName);
    } else if (region == "FOREX") data = stockTickerOverview_fx(tickerName);
    
        PriceChart.getRange('B7').setValue(data.shortName);
        PriceChart.getRange('B8').setValue(data.exchange);
        PriceChart.getRange('B9').setValue(data.establishedYear);
        PriceChart.getRange('B10').setValue(data.website);
        PriceChart.getRange('B11').setValue(data.stockRating);
    } catch (e) {};
}

function Reset() {
    var PriceChart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PriceChart');
    var region = PriceChart.getRange("A4").getValue();
    var dateOffset = (24 * 60 * 60 * 1000);
    var end = new Date();
    var start = new Date(end - dateOffset * 365 * 3)
    PriceChart.getRange("I23").setValue(end.toLocaleDateString('en-GB'));
    PriceChart.getRange("G23").setValue(start.toLocaleDateString('en-GB'));
    updateTickerOverview(region);
    updateHistoricalData(region);
}

function sendResultToEmail() {
    Logger.log(arguments.callee.name);
    var PriceChart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PriceChart");
    var historicalPrice = PriceChart.getRange("D24:J629").getValues();
    if (historicalPrice == '') return;
    var predictPrice = PriceChart.getRange('Q32:Q61').getValues();
    var predictDay = PriceChart.getRange('M32:M61').getValues();
    var ticker = PriceChart.getRange('B4').getValue();
    var region = PriceChart.getRange('A4').getValue();
    var predictData = new Array();
    predictData.push(predictDay);
    predictData.push(predictPrice);

    var recipient = Session.getActiveUser().getEmail();
    Logger.log(MailApp.getRemainingDailyQuota() + ' remain email');
    MailApp.sendEmail({
        to: recipient,
        subject: 'APP_QLDA: ' + ticker + ':' + region + ' Historical and predict data ',
        htmlBody: arrayToHTML(historicalPrice, "Historical data") + arrayToHTML(predictData, "Predict data")
    });
}

function arrayToHTML(result, title) {
    var html = "<h3>" + title + "</h3><br>";
    html += "<table border=2>";
    for (var i = 0; i < result.length; i++) {
        html += "<tr>";
        //var cv = new Date(result[i][0]);
        //result[i][0] = cv.toISOString().split('T')[0];
        for (var j = 0; j < result[0].length; j++) {
            html += "<td>";
            html += result[i][j];
            html += "</td>";
        }
        html += "</tr>";
    }
    html += "</table>";
    return html;
}
