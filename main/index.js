var CSW = require('../csw'),
    WFS = require('../wfs'),
    logging = require('../logging');

// ## Scrape a CSW service and index WFS responses
// 
// This is going to:
//
// 1. Go to a CSW endpoint and make `GetRecord` requests in order to find all the available metadata IDs. Cache the document in CouchDB.
// 2. Make `GetRecordById` requests in order to grab each of those metadata records. Cache each document in CouchDB.
// 3. Optionally, will only pay attention to CSW records that satisfy a particular keyword criteria.
// 4. Find all URLs to WFS resources in that catalog, or in the records that meet the optional criteria.
// 5. Make a `GetFeature` request to each WFS that was located. Cache each document in CouchDB.
// 6. Process each `GetFeature` response document and parse them out into GeoJSON documents. Cache each document.
//
// Please pass in an `options` object and a callback to fire when everything is finished.
// 
//     options = {
//         cswUrl: 'http://server.com/csw',
//         keyword: 'some optional criteria'
//     }

function scrapeCsw(options, callback) {
    if (!options.hasOwnProperty('cswUrl')) {
        callback(new Error('No cswUrl was specified'));
        return;
    }
    
    var csw = new CSW(options.cswUrl);
    csw.harvest(callback);
}

module.exports = {
    scrapeCsw: scrapeCsw    
};