#!/usr/bin/env node
var couch = require('../couch');

couch.purgeDbs(function (err) {
    if (err) { console.log(err); return; }
    console.log('Databases have been deleted');
});