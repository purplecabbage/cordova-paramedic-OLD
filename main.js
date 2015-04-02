#!/usr/bin/env node

var parseArgs = require('minimist'),
    paramedic = require('./paramedic');

var plugins,
    platformId;

var USAGE = "Error missing args. \n" +
	"cordova-paramedic --platform PLATFORM --plugin PATH [--justbuild --timeout MSECS --port PORTNUM]" +
	"`PLATFORM` : the platform id, currently only supports 'ios'\n" +
	"`PATH` : the relative or absolute path to a plugin folder\n" +
					"\texpected to have a 'tests' folder.\n" +  
					"\tYou may specify multiple --plugin flags and they will all\n" + 
					"\tbe installed and tested together.\n" +
	"`MSECS` : (optional) time in millisecs to wait for tests to pass|fail \n" +
			  "\t(defaults to 10 minutes) \n" +
	"`PORTNUM` : (optional) port to use for posting results from emulator back to paramedic server\n" +
	"--justbuild : (optional) just builds the project, without running the tests"; 

var argv = parseArgs(process.argv.slice(2));

if(!argv.platform || !argv.plugin) {
    console.log(USAGE);
    process.exit(1);
}

platformId = argv.platform;
plugins = argv.plugin;
plugins = Array.isArray(plugins) ? plugins : [plugins];

var onComplete = function(resCode,resObj,logStr) {
	console.log("result code is : " + resCode + "\n" + JSON.stringify(resObj));
	console.log(logStr);
	process.exit(resCode);
}


paramedic.run(platformId, plugins, onComplete, argv.justbuild, argv.port, argv.timeout,true);

