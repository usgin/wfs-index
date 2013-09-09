#!/usr/bin/env node
// # indexFeatures.js
//
// This file can be used to run an indexing job.
//
// The only input parameters are
//
// - `-c http://server.com/the/csw/to/index`: Specify the CSW that should be scraped
// - `-f featureTypeName`: Specify the name of the featureType that should be indexed
// - `-v viewName`: Specify the name of the mapping function that processes these features for the Solr index
 
var main = require('../main'),
    indexer = require('../indexer'),
    couch = require('../couch');

function itsGoTime(cswUrl, featureType, viewName, callback) {
    callback = callback || function () {};
    
    function finishedIndexing(err, response) {
        if (err) {
            console.log('Error during indexing');
            console.log(err);
            callback(err);
            return;
        }
        
        console.log('Completed successfully');
        callback(null, 'You win');
    }
    
    function cswScraped(err, wfsSet, rejects, errors) {
        if (err) {
            console.log('Error encountered scraping the CSW at "' + cswUrl + '"');
            console.log(err);
            callback(err);
            return;
        }
        
        // Let's talk about the results
        console.log('Found ' + wfsSet.length + ' WFS services containing ' + featureType + ' features');
        console.log('Found ' + rejects.length + ' other WFS services that did not contain the requested featureType');
        console.log(errors.length + ' WFS services failed to communicate properly');
        
        // Then let's index
        indexer.addToIndex(viewName, finishedIndexing);
    }
    
    function checkedView(err, response) {
        if (err) {
            console.log('Error accessing the mapping function "' + viewName + '"');
            console.log(err);
            callback(err);
            return;
        }
        
        // Scrape the CSW
        var options = {
            cswUrl: cswUrl,
            featureType: featureType
        };
        
        main(options, cswScraped);
    }
    
    function dbReady(err) {
        if (err) { 
            console.log('Error setting up the database:');
            console.log(err);
            callback(err);
            return; 
        }
        
        // Make sure that the view exists
        couch.dbs['feature-cache'].view('forIndexes', viewName, checkedView);
    }
    
    // Build the CouchDB
    couch.setup(dbReady);
}

// Run this with args if it is run directly, otherwise export the work function (like, for tests)
if (require.main === module) {
    var argv = require('optimist')
        .demand('c')
        .alias('c', 'cswUrl')
        .describe('c', 'The URL for a CSW to scrape')
        .demand('f')
        .alias('f', 'featureType')
        .describe('f', 'The WFS FeatureType that should be indexed')
        .demand('v')
        .alias('v', 'viewName')
        .describe('v', 'The name of the mapping function that processes these features for the Solr index')
        .argv;
    
    itsGoTime(argv.cswUrl, argv.featureType, argv.viewName);
} else {
    module.exports = itsGoTime;
}
