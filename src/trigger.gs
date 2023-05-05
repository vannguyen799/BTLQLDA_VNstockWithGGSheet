function initFunc() {
    deleteAllTrigger();
    createOnOpenTrigger("onOpenTrigger");
    createOnEditTrigger("onEditTrigger");
}

function onEditTrigger(e) {
    var Priceboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Priceboard");
    var PriceChart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PriceChart");
    var tickerSearch = Priceboard.getRange("C7").getValue();
    if (e.range.getA1Notation() == "C5" && tickerSearch != '') searchTicker();
    else if (e.range.getA1Notation() == "C5") listTickerDisplay();
    if (e.range.getA1Notation() == "C7" && e.range.getValue() == '') listTickerDisplay();
    if (e.range.getA1Notation() == "C7" && e.range.getValue() != '') searchTicker();

    //input ticker in PriceChart
    if (e.range.getA1Notation() == "B4" && e.range.getValue() != '') {
        var dateOffset = (24*60*60*1000);
        var end = new Date();
        var start = new Date(end-dateOffset*365*3)
        PriceChart.getRange("I23").setValue(end.toLocaleDateString('en-GB'));
        PriceChart.getRange("G23").setValue(start.toLocaleDateString('en-GB'));
        updateTickerOverview();
        updateHistoricalData();
        return;
    }

    //input start va end cua lich su gia
    if ((e.range.getA1Notation() == "G23" && e.range.getValue() != '')
    ||  (e.range.getA1Notation() == "I23" && e.range.getValue() != '') ){ 
        if (PriceChart.getRange("G23").getValue() < PriceChart.getRange("I23").getValue())
        updateHistoricalData(); 
        else  PriceChart.getRange("J23").setValue("Invalid!").setFontColor("red");
        return;
    }
}

function onOpenTrigger()
{
  realtime();
}

function realtime() {
  try{
    deleteTriggerWithName(arguments.callee.name);
  createTimeDrivenTriggers(arguments.callee.name,5);
  } catch (e) {};
  var Priceboard  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Priceboard");
    while (true) {
        var s = 1*1000; Logger.log('sleeping ' + s);  Utilities.sleep(s);
        realtimePriceUpdate(Priceboard);
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
