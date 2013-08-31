#!/usr/bin/env node

var fs = require('fs'),
    
    _ = require('underscore'),
    
    // You can pass flags to setup.js to specify parameters
    argv = require('optimist')
    .alias('d', 'dbHost')
    .default('d', 'http://localhost:5984')
    .alias('s', 'solrHost')
    .default('s', 'http://localhost:8983')
    .argv,

    configuration = {
        dbHost: argv.dbHost,
        solrHost: argv.solrHost
    };

// Or you can write values to a file called `defaults.json`
if (fs.existsSync('./defaults.json')) {
    _.extend(configuration, JSON.parse(fs.readFileSync('./defaults.json')));
}

fs.writeFile('./configuration.js', 'module.exports=' + JSON.stringify(configuration));