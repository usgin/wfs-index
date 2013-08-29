var solr = require('solr-client'),
    client = solr.createClient(),
    _ = require('underscore');

client.autoCommit = true;

module.exports = function addToIndex(features, map, callback) {
    var docs = _.map(features, map);

    client.add(docs, callback);
};