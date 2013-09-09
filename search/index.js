var solr = require('solr-client'),
    client = solr.createClient();
    
module.exports = {
    getAll: function (callback) {
        require('./getAll')(client, callback);
    }
};