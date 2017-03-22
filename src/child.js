var moment = require("moment");
var request = require("superagent");

var UUID = fin.desktop.Application.getCurrentApplication().uuid;

function startTest() {
    var startCount;
    var start;
    //If we want to run the tests more than 1 time per application
    var loopCount = startCount = 1;
    var timeList = [];
    function runTest(params) {
        if (loopCount === 0) {
            var totalTime = 0;
            for (var i = 0; i < timeList.length; i++) {
                totalTime += timeList[0];
            }
            log("total Time taken:" + totalTime + "  startTime::" + start.format('MMMM Do YYYY, h:mm:ss a') + "  :::endtime:" + moment().format('MMMM Do YYYY, h:mm:ss a'));
            fin.desktop.Application.getCurrentApplication().terminate();;
        }
        runOpenFinTest(loopCount, params, function (err, time) {
            timeList.push(time);
            loopCount--;
            runTest();
        });

    }
    var finWindow = fin.desktop.Window.getCurrent();

    finWindow.getOptions(function (options) {
        var windowCount = options.customData.windowCount ? options.customData.windowCount : 10;
        start = moment();
        runTest({ windowCount: windowCount, url: options.customData.url });
    });

};
function log(text) {
    request
        .post('/savelog')
        .send(UUID + "::" + text)
        .end(function (err, res) {
        });
    //document.getElementById("debugLogs").innerHTML += text;
};

function runOpenFinTest(loopNumber, params, callback) {
    var spawnCount = params.windowCount;
    var wins = [];
   
    function spawnOpenFin(i, cb) {
        log("window creation Started " + UUID + ":::" + i + "  Start Time:" + moment().format('MMMM Do YYYY, h:mm:ss a'))
        var newWin = new fin.desktop.Window({
            name: i + String(loopNumber) + 'window',
            url: params.url ? params.url : "http://localhost",
            "applicationIcon": "http://localhost/imgs/CIQ_Taskbar_Icon.png",

            defaultTop: 100,
            defaultLeft: 100,
            defaultWidth: 400,
            defaultHeight: 400,
            waitForPageLoad: false,
            showTaskbarIcon: false,
            minWidth: 0,
            minHeight: 0,
            autoShow: true,
            frame: true,
            resizeRegion: {
                size: 10,
                bottomCorner: 10
            },
            resizable: true,
            maximizable: true,
            alwaysOnTop: false,
            fixedPosition: false,
            hoverFocus: false,
            saveWindowState: false,
            frameConnect: 'main-window'
        }, function () {
            log("window finshed " + UUID + ":::" + i + "  End Time:" + moment().format('MMMM Do YYYY, h:mm:ss a'))
            cb(null, newWin);

        }, function (err) {
            console.log(err, i + String(loopNumber) + 'window');

        });
        wins.push(newWin);
    }
    var spawnedCount = 0;
    function windowComplete(err, newWin) {
        //delete wins[newWin.name];
        spawnedCount++;
        var count = Object.keys(wins).length;
        if (spawnedCount === spawnCount) {
            var endTime = moment();
            console.log("spawnedCount", spawnedCount);
            var finalTime = moment.duration(endTime - startTime).asSeconds();
            log("Final Time for " + spawnCount + " windows:" +
                finalTime + " for an average of " + (Math.round((finalTime / spawnCount) * 100) / 100) + " seconds per window");

            console.log("finishTime", finalTime);
            for (var i = 0; i < wins.length; i++) {
                wins[i].close();
            }
            return callback(null, finalTime);
        }
    }
    var allComplete = false;
    var startTime = moment();
    for (var i = 0; i < spawnCount; i++) {
        spawnOpenFin(i, windowComplete);
    }
    allComplete = true;
}


startTest();