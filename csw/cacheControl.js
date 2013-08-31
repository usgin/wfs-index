var couch = require('../couch'),
    request = require('request');

module.exports = function (cswUrl, parser, callback) {
    var cacheId = couch.url2Id(cswUrl);
    
    function cachedRecord(err, response) {
        if (err) { callback(err); return; }
        
        couch.dbs['csw-cache'].get(cacheId, checkedCache);
    }
    
    function gotCswResponse(err, response, body) {
        if (err) { callback(err); return; }
        
        couch.cacheCsw(cswUrl, body, cachedRecord); // function (cswRequestUrl, cswResponseString, callback)
    }
    
    function checkedCache(err, doc) {
        if (err && err.status_code !== 404) { callback(err); return; }
        
        if (doc) {
            parser.write(doc.response);
            parser.end();
        }
        
        request(cswUrl, gotCswResponse);
    }
    
    couch.dbs['csw-cache'].get(cacheId, checkedCache);
};