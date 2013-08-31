var crypto = require('crypto'),
    
    nano = require('nano'),
    _ = require('underscore'),
    
    config = require('../configuration'),
    
    dbNames = [ 'csw-cache', 'wfs-cache', 'feature-cache' ],
    connection = require('nano')(config.dbHost),
    
    updateDoc = require('./updateDoc'),         // function (db, docId, document, callback)
    parseFeatures = require('./parseFeatures'); // function (wfsDb, featureDb, wfsId, callback)

function hashUrl(url) {
    var hash = crypto.createHash('sha256');
    hash.update(url);
    return hash.digest('hex');
}

var couch = {
    dbNames: dbNames,
    
    dbs: {},
    
    connection: connection,
    
    url2Id: hashUrl,
    
    makeDbs: function (callback) {
        require('./makeDbs')(connection, dbNames, callback);
    },
    
    purgeDbs: function (callback) {
        require('./purgeDbs')(connection, dbNames, callback);
    },
    
    cacheWfs: function (wfsRequestUrl, wfsResponseString, callback) {
        var doc = { 
            requestUrl: wfsRequestUrl,
            response: wfsResponseString 
        },
            docId = hashUrl(wfsRequestUrl);
        
        updateDoc(connection.db.use('wfs-cache'), docId, doc, callback);
    },
    
    cacheFeatures: function (wfsRequestUrl, callback) {
        parseFeatures(
            connection.db.use('wfs-cache'), 
            connection.db.use('feature-cache'), 
            hashUrl(wfsRequestUrl), 
            callback
        );
    }
};

_.each(dbNames, function (dbName) {
    couch.dbs[dbName] = couch.connection.use(dbName);    
});

module.exports = couch;