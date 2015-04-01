#!/usr/bin/env node

var parseArgs = require('minimist'),
    paramedic = require('./paramedic');

var plugins,
    platformId;

var USAGE = "Error missing args. \n Usage: $cordova-paramedic " +
            "  --platform CORDOVA-PLATFORM --plugin PLUGIN-PATH [--justbuild ] [--port PORT] [--timeout TIMEOUT] \n" +
            " CORDOVA-PLATFORM : Which platform to build target\n" +
            " PLUGIN-PATH : Path to the plugin to install.\n" +
            " --justbuild : Will not run tests, just verify that the plugin+platform can be built.\n" +
            " TIMEOUT : time to wait for tests to run, in msecs, default is 10 minutes."; 

var argv = parseArgs(process.argv.slice(2));

if(!argv.platform || !argv.plugin) {
    console.log(USAGE);
    process.exit(1);
}

platformId = argv.platform;
plugins = argv.plugin;
plugins = Array.isArray(plugins) ? plugins : [plugins];

var onComplete = function(resCode,resObj) {
	console.log("result is : " + resCode + "\n" + JSON.stringify(resObj));
	process.exit(resCode);
}


paramedic.run(platformId, plugins, onComplete, argv.justbuild, argv.port, argv.timeout);

