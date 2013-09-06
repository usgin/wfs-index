#!/usr/bin/env node
var couch = require('../couch');

couch.makeDbs(function (err) {
    if (err) { console.log(err); return; }
    couch.setup(function (err) {
        if (err) { console.log(err); return; }
        console.log('Databases have been set up');
    });
})