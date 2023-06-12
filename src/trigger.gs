function initFunc() {
    deleteAllTrigger();
    createOnOpenTrigger("onOpenTrigger");
    createOnOpenTrigger("onOpenPriceChart");
    createOnEditTrigger("onEditTrigger");
}

function onEditTrigger(e) {
    var rangeName = e.range.getA1Notation();
    var activeSheet = e.range.getSheet().getName();
    var Priceboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Priceboard");
    var PriceChart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PriceChart");
    if (activeSheet == "Priceboard") {
        if (rangeName != 'C5' && rangeName != 'C7') return;
        var tickerSearch = Priceboard.getRange("C7").getValue();
        if (rangeName == "C5" && tickerSearch != '') searchTicker();
        else if (rangeName == "C5") listTickerDisplay();
        if (rangeName == "C7" && e.range.getValue() == '') listTickerDisplay();
        if (rangeName == "C7" && e.range.getValue() != '') searchTicker();
        realtime();
    } 
    else 
    if (activeSheet == "PriceChart") {
        //input ticker in PriceChart
        var region = PriceChart.getRange("A4").getValue();
        if ((rangeName == "B4" && e.range.getValue() != '') || (rangeName == "A4")) {
            var dateOffset = (24 * 60 * 60 * 1000);
            var end = new Date();
            var start = new Date(end - dateOffset * 365 * 3)
            PriceChart.getRange("I23").setValue(end.toLocaleDateString('en-GB'));
            PriceChart.getRange("G23").setValue(start.toLocaleDateString('en-GB'));
            updateTickerOverview(region);
            updateHistoricalData(region);
            return;
        }

        //input start va end cua lich su gia
        if ((rangeName == "G23" && e.range.getValue() != '') ||
            (rangeName == "I23" && e.range.getValue() != '')) {
            if (PriceChart.getRange("G23").getValue() < PriceChart.getRange("I23").getValue())
                updateHistoricalData(region);
            else PriceChart.getRange("J23").setValue("Invalid!").setFontColor("red");
            return;
        }
    }
}

function onOpenTrigger() {
    menuCustom();
    realtime();
}

function onOpenPriceChart() {
    var PriceChart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PriceChart');
    var lastOpenDate = PriceChart.getRange("E1").getValue();
    //lastOpenDate = lastOpenDate.toLocaleDateString('en-GB');
    var last  = lastOpenDate.getTime();
    //last = Date.parse(last);
    var end = new Date();
    end = end.toLocaleDateString('en-GB');
    end = Date.parse(end);

    Logger.log(last + "->" + end);
    if (last < end) {
        
        Logger.log("------nextDayUpdate")
        end = new Date(end);
        PriceChart.getRange("E1").setValue(end.toLocaleDateString('en-GB'));
        Reset();
    }
}

function realtime() {
    try {
        deleteTriggerWithName(arguments.callee.name);
        createTimeDrivenTriggers(arguments.callee.name, 5);
    } catch (e) {};
    var Priceboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Priceboard");

    while (true) {
        var type = Priceboard.getRange("C5").getValue();
        realtimePriceUpdate(Priceboard, type);
        var s = 1 * 1000;
        Logger.log('sleeping ' + s);
        Utilities.sleep(s);
        var curWDay = new Date().getDay();
        if (curWDay == 0 || curWDay == 6) return;
        var curHour = new Date().getHours();
        if (curHour < 9 || curHour > 15) return;
    }
}

function createOnOpenTrigger(functionName) {
    ScriptApp.newTrigger(functionName)
        .forSpreadsheet(SpreadsheetApp.getActive())
        .onOpen()
        .create();
}

function createOnEditTrigger(functionName) {
    ScriptApp.newTrigger(functionName)
        .forSpreadsheet(SpreadsheetApp.getActive())
        .onEdit()
        .create();
}

function createTimeDrivenTriggers(functionName, minutes) {
    ScriptApp.newTrigger(functionName)
        .timeBased()
        .after(minutes * 60 * 1000)
        .create();
}

function deleteAllTrigger() {
    ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
}
