#!/usr/bin/env node
var couch = require('../couch');

couch.setup(function (err) {
    if (err) { console.log(err); return; }
    console.log('Databases have been set up');
});
