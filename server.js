var express = require("express");
var app = express();
var nocache = require('nocache');
var path = require('path');
var rootDir = path.join(__dirname, "./dist");
var fs = require('fs');
var bodyParser = require('body-parser');
var async = require("async");
process.on('uncaughtException', function (err) {
    console.log(err);
});

app.use(express.static(rootDir));
app.use(bodyParser());
var PORT = process.env.PORT || 80;
var server = app.listen(PORT, function () {
    console.log("listening on port:" + PORT)
    app.use(nocache());

    app.post("/savelog", function (req, res) {
        if (!req.body) { res.send(); }
        checkFile(req.body, function (err) {
            console.log(err);
            res.send();
        });


    });
    //for anything not route no caught
    app.use(function (req, res, next) {
        console.log("Retrieving: ", req.url);
        next();
    });
});


function checkFile(data, callback) {
    var tasks = [
        function checkFolderPath(done) {
            fs.exists("logs", function (exists) {
                if (!exists) { return createLogFolder(done); }
                done();
            });
        },
        function checkFilePath(done) {
            fs.exists("./logs/test.txt", function (exists) {
                if (!exists) { return createLogFile(done); }
                done();
            });

        },
        function writeFile(done) {
            writeToLog(data, done);
        }
    ];

    async.series(tasks, function (err) {
        callback(err);
    });
}
function createLogFolder(callback) {
    fs.mkdir("logs", callback);
}

function createLogFile(callback) {
    fs.writeFile("logs/test.txt", 'Starting the log file' + "\r\n", (err) => {
        callback(err);
    });
}

function writeToLog(object, callback) {
    fs.appendFile("logs/test.txt", JSON.stringify(object) + "\r\n", function (err) {
        callback(err);
    });
}