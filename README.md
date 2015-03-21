cordova-paramedic
=================

[![Build Status](https://travis-ci.org/purplecabbage/cordova-paramedic.svg?branch=master)](https://travis-ci.org/purplecabbage/cordova-paramedic)

Runs cordova medic/buildbot tests locally.

... provides advanced levels of care at the point of illness or injury, including out of hospital treatment, and diagnostic services

To install :
``` $npm install cordova-paramedic ```

Usage :

```cordova-paramedic --platform CORDOVA-PLATFORM --plugin PLUGIN-PATH [--justbuild --timeout MSECS --port PORTNUM]```

    CORDOVA-PLATFORM : the platform id, currently only supports 'ios'
    PLUGIN-PATH : the relative path to the plugin folder, expected to have a 'tests' folder
    MSECS : (optional) time in millisecs to wait for tests to pass|fail ( defaults to 10 minutes )
    PORTNUM : (optional) port to use for posting results from emulator back to paramedic server
    --justbuild : (optional) just builds the project, without running the tests

