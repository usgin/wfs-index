var solr = require('solr-client'),
    client = solr.createClient(),
    field = 'id',
    query = '*';

module.exports = function purgeIndex(callback) {
   client.delete(field, query, callback);
};