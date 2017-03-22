var moment = require('moment');
var request = require("superagent");
console.log("started");

function testSpawns() {
    var self = this;
    this.init = function () {
        document.getElementById('startTest').addEventListener('click', self.buttonTest);
    };

    this.buttonTest = function () {
        console.log("click")
        var params = {
            appCount: Number(document.getElementById('spawnCount').value),
            windowCount: Number(document.getElementById('windowCount').value),
            url: document.getElementById('url').value
        };
        var windowCount = 1;
        log({ data: "=====" + params.appCount + " applications ---" + params.windowCount + " windows======startTime===" + moment().format('MMMM Do YYYY, h:mm:ss a') });

        for (var i = 0; i < params.appCount; i++) {
            self.startApplicationTest(i, params);
        }
    };
    function log(text) {
        request
            .post('/savelog')
            .send(text)
            .end(function (err, res) {
            });

    };

    var UUID = fin.desktop.Application.getCurrentApplication().uuid;

    this.startApplicationTest = function (index, params) {
        log("application Starting:" + "testApplication" + index + UUID);
        console.log("application Starting:" + "testApplication" + index + UUID);
        //self.startTest(params);
        var app = new fin.desktop.Application({
            "name": "ChartIQ Local",
            "url": "http://localhost/child.html",
            "uuid": "testApplication" + index + UUID,
            "defaultTop": 100,
            "defaultLeft": 100,
            "showTaskbarIcon": true,
            "autoShow": true,
            "frame": false,
            "resizable": false,
            "maximizable": false,
            "delay_connection": true,
            "contextMenu": true,
            "cornerRounding": {
                "width": 4,
                "height": 4
            },
            "alwaysOnTop": false,
            "frameConnect": "main-window",
            customData: {
                "windowCount": params.windowCount,
                "url": params.url
            }
        }, function () {
            app.run();

        }, function (error) {
            console.log("Error creating application:", error);
        });
        app.addEventListener("closed", function (event) {
           // log("testApplication" + index + UUID + "::closed");
        }, function () {

        }, function (reason) {
            console.log("failure: " + reason);
        });



    };

    return self;
};

function runOpenFinTest(spawnCount, loopNumber, params, callback) {
    var wins = [];
    function spawnOpenFin(i, cb) {
        var newWin = new fin.desktop.Window({
            name: i + String(loopNumber) + 'window',
            url: params.url ? params.url : "http://localhost",
            defaultTop: 100,
            defaultLeft: 100,
            defaultWidth: 400,
            defaultHeight: 400,
            showTaskbarIcon: true,
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
            //log("Final Time for " + spawnCount + " windows:" +
            //finalTime + " for an average of " + (Math.round((finalTime / spawnCount) * 100) / 100) + " seconds per window:::"+
            //	"start time:" + startTime + "::endtime:" + endTime);

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


//define the rest of your service's functionality here.
var testSpawns = new testSpawns("testSpawnsService");
window.onload = testSpawns.init;



window.testSpawns = testSpawns;