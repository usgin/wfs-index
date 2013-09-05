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

//'{"_southWest":{"lat":37.41925395973696,"lng":-92.51861572265625},"_northEast":{"lat":37.72076290898373,"lng":-91.1480712890625}}'

//geo:[37.41925395973696,-92.51861572265625 TO 37.72076290898373,-91.1480712890625]