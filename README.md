cordova-paramedic
=================

[![Build Status](https://travis-ci.org/purplecabbage/cordova-paramedic.svg?branch=master)](https://travis-ci.org/purplecabbage/cordova-paramedic)

Runs cordova medic/buildbot tests locally.

... provides advanced levels of care at the point of illness or injury, including out of hospital treatment, and diagnostic services

To install :
``` $npm install cordova-paramedic ```

Usage :

```
cordova-paramedic --platform CORDOVA-PLATFORM --plugin PLUGIN-PATH [--justbuild --timeout MSECS --port PORTNUM]

	`CORDOVA-PLATFORM` : the platform id, currently supports `ios|android|windows` and barely `browser`
	`PLUGIN-PATH` : the relative or absolute path to a plugin folder
					expected to have a 'tests' folder. 
					You may specify multiple --plugin flags and they will all 
					be installed and tested together.
	`MSECS` : (optional) time in millisecs to wait for tests to pass|fail 
			  (defaults to 10 minutes)
	`PORTNUM` : (optional) port to use for posting results from emulator back to paramedic server
	--justbuild : (optional) just builds the project, without running the tests
```

You can also use cordova-paramedic as a module directly :

```
  var paramedic = require('cordova-paramedic');
  paramedic.run('ios','../cordova-plugin-device',bJustBuild,nPort,msTimeout);
```


