var solr = require('solr-client'),
    client = solr.createClient(),
    _ = require('underscore'),
    
    couch = require('../couch');

client.autoCommit = true;

module.exports = function addToIndex(mapName, callback) {
    callback = callback || function () {};
    
    couch.dbs['feature-cache'].view('forIndexes', mapName, { include_docs: true }, function (err, response) {
        if (err) { callback(err); return; }
        
        // Could process the docs a little here for default stuff. for example:
        var docs = _.map(response.rows, function(row, index) {
            return _.extend({ geojson: JSON.stringify(row.doc.geometry) }, row.value);    
        });
        
        client.add(docs, callback);
    });
};