#!/usr/bin/env node

var parseArgs = require('minimist'),
    paramedic = require('./paramedic');

var plugins,
    platformId;

var USAGE = "Error missing args. \n Usage: $cordova-paramedic " +
            "  --platform CORDOVA-PLATFORM --plugin PLUGIN-PATH [--port PORT]";    

var argv = parseArgs(process.argv.slice(2));

if(!argv.platform || !argv.plugin) {
    console.log(USAGE);
    process.exit(1);
}

platformId = argv.platform;
plugins = argv.plugin;
plugins = Array.isArray(plugins) ? plugins : [plugins];


paramedic.run(platformId,plugins,argv.justbuild,argv.port,argv.timeout);




