#!/usr/bin/env node

var http = require('http'),
    localtunnel = require('localtunnel'),
    parseArgs = require('minimist'),
    shell = require('shelljs'),
    fs = require('fs'),
    request = require('request'),
    tmp = require('tmp'),
    path = require('path');

var tunneledUrl = "";
var PORT = 8008;
var TIMEOUT = 10 * 60 * 1000; // 10 minutes in msec - this will become a param
var USAGE = "Error missing args. \n Usage: $cordova-paramedic " +
            "  --platform CORDOVA-PLATFORM --plugin PLUGIN-PATH [--port PORT]";

var TMP_FOLDER = null;
var storedCWD = process.cwd();

var JustBuild = false;

var plugin,platformId;


(function run_main() { // main program here 
    init();
    createTempProject();
    installPlugins();
    startServer();
})();

function init() {
    var argv = parseArgs(process.argv.slice(2));

    if(!argv.platform || !argv.plugin) {
        console.log(USAGE);
        process.exit(1);
    }

    platformId = argv.platform;
    plugin = argv.plugin;

    // TODO: validate that port is a number
    PORT = argv.port || PORT;
    JustBuild = argv.justbuild || JustBuild; 
    TIMEOUT = argv.timeout || TIMEOUT;

    var cordovaResult = shell.exec('cordova --version', {silent:true});
    if(cordovaResult.code) {
        console.error(cordovaResult.output);
        process.exit(cordovaResult.code);
    }
}

function createTempProject() {
    TMP_FOLDER = tmp.dirSync();
    tmp.setGracefulCleanup();
    
    console.log("cordova-paramedic :: creating temp project");
    shell.exec('cordova create ' + TMP_FOLDER.name);
    shell.cd(TMP_FOLDER.name);
}

function installPlugins() {

    console.log("cordova-paramedic :: installing " + plugin);
    
    var pluginPath = path.join(storedCWD, plugin);

    var installExitCode = shell.exec('cordova plugin add ' + pluginPath,
                                     {silent:true}).code;
    if(installExitCode != 0) {
        console.error('Failed to install plugin : ' + plugin);
        cleanUpAndExitWithCode(1);
        return;
    }

    if(!JustBuild) { 
        // we only install the test stuff if needed
        console.log("cordova-paramedic :: installing " + path.join(pluginPath,'tests'));
        installExitCode = shell.exec('cordova plugin add ' + path.join(pluginPath,'tests'),
                                     {silent:true}).code;
        if(installExitCode != 0) {
            console.error('Failed to find /tests/ for plugin : ' + plugin);
            cleanUpAndExitWithCode(1);
            return;
        }

        console.log("cordova-paramedic :: installing plugin-test-framework");
        installExitCode = shell.exec('cordova plugin add https://github.com/apache/cordova-plugin-test-framework',
                                     {silent:true}).code;
        if(installExitCode != 0) {
            console.error('cordova-plugin-test-framework');
            cleanUpAndExitWithCode(1);
            return;
        }
    }
}

function addAndRunPlatform() {

    if(JustBuild) {
        console.log("cordova-paramedic :: adding platform");
        shell.exec('cordova platform add ' + platformId,{silent:true});
        shell.exec('cordova prepare',{silent:true});
        console.log("building ...");
        shell.exec('cordova build ' + platformId.split("@")[0],
            {async:true,silent:true},
            function(code,output){
                if(code != 0) {
                    console.error("Error: cordova build returned error code " + code);
                    console.log("output: " + output);
                    cleanUpAndExitWithCode(1);
                }
                else {
                    console.log("lookin' good!");
                    cleanUpAndExitWithCode(0);
                }
            }
        );
    }
    else {
        setConfigStartPage();
        console.log("cordova-paramedic :: adding platform");
        shell.exec('cordova platform add ' + platformId,{silent:true});
        shell.exec('cordova prepare',{silent:true});
        // limit runtime to TIMEOUT msecs
        setTimeout(function(){
            console.error("This test seems to be blocked :: timeout exceeded. Exiting ...");
            cleanUpAndExitWithCode(1);
        },(TIMEOUT));

        shell.exec('cordova emulate ' + platformId.split("@")[0] + " --phone",
            {async:true,silent:true},
            function(code,output){
                if(code != 0) {
                    console.error("Error: cordova emulate return error code " + code);
                    console.log("output: " + output);
                    cleanUpAndExitWithCode(1);
                }
            }
        );
    }
}

function cleanUpAndExitWithCode(exitCode) {
    shell.cd(storedCWD);
    // the TMP_FOLDER.removeCallback() call is throwing an exception, so we explicitly delete it here
    shell.exec('rm -rf ' + TMP_FOLDER.name);
    
    process.exit(exitCode);
}

function writeMedicLogUrl(url) {
    console.log("cordova-paramedic :: writing medic log url to project");
    var obj = {logurl:url};
    fs.writeFileSync(path.join("www","medic.json"),JSON.stringify(obj));
}


function setConfigStartPage() {

    console.log("cordova-paramedic :: setting app start page to test page");

    var fileName = 'config.xml';
    var configStr = fs.readFileSync(fileName).toString();
    if(configStr) {
        configStr = configStr.replace("src=\"index.html\"","src=\"cdvtests/index.html\"");
        fs.writeFileSync(fileName, configStr);
    }
    else {
        console.error("Oops, could not find config.xml");
    }
}

function startServer() {

    if(JustBuild) {
        addAndRunPlatform();
        return;
    }

    console.log("cordova-paramedic :: starting local medic server " + platformId);
    var server = http.createServer(requestListener);
    server.listen(PORT, '127.0.0.1',function onServerConnect() {

        switch(platformId) {
            case "ios"     :  // intentional fallthrough
            case "windows" :
                writeMedicLogUrl("http://127.0.0.1:" + PORT);
                addAndRunPlatform();
                break;
            case "android" :
                writeMedicLogUrl("http://10.0.2.2:" + PORT);
                addAndRunPlatform();
                break;
                break;
            case "wp8" :
                //localtunnel(PORT, tunnelCallback);
                request.get('http://google.com/', function(e, res, data) {
                    if(e) {
                        console.error("failed to detect ip address");
                        cleanUpAndExitWithCode(1);
                    }
                    else {
                        console.log("res.req.connection = " + res.req.connection);
                        var ip = res.req.connection.localAddress ||
                                 res.req.socket.localAddress;
                        console.log("Using ip : " + ip);
                        writeMedicLogUrl("http://" + ip + ":" + PORT);
                        addAndRunPlatform();
                    }
                });
                break;
            default :
                console.log("platform is not supported :: " + platformId);
                cleanUpAndExitWithCode(1);
        }
    });
}

function requestListener(request, response) {
    if (request.method == 'PUT' || request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;
            // Too much POST data, kill the connection!
            if (body.length > 1e6) {
                req.connection.destroy();
            }
        });
        request.on('end', function (res) {
            if(body.indexOf("mobilespec")  == 2){ // {\"mobilespec\":{...}}
                try {
                    console.log("body = " + body);
                    var results = JSON.parse(body);
                    console.log("Results:: ran " + 
                        results.mobilespec.specs + 
                        " specs with " + 
                        results.mobilespec.failures + 
                        " failures");
                    if(results.mobilespec.failures > 0) {
                        cleanUpAndExitWithCode(1);
                    }
                    else {
                        cleanUpAndExitWithCode(0);
                    }
                    
                }
                catch(err) {
                    console.log("parse error :: " + err);
                    cleanUpAndExitWithCode(1);
                }
            }
            else {
                console.log("console-log:" + body);
            }
        });
    }
    else {
        console.log(request.method);
        response.writeHead(200, { 'Content-Type': 'text/plain'});
        response.write("Hello"); // sanity check to make sure server is running
        response.end();
    }
}

function tunnelCallback(err, tunnel) {
    if (err){
        console.log("failed to create tunnel url, check your internet connectivity.")
        cleanUpAndExitWithCode(1);
    }
    else {
        // the assigned public url for your tunnel
        // i.e. https://abcdefgjhij.localtunnel.me
        tunneledUrl = tunnel.url;
        console.log("cordova-paramedic :: tunneledURL = " + tunneledUrl);
        writeMedicLogUrl(tunneledUrl);
        addAndRunPlatform();
    }
}

