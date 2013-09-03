var crypto = require('crypto'),
    url = require('url'),
    
    nano = require('nano'),
    _ = require('underscore'),
    
    config = require('../configuration'),
    
    dbNames = [ 'csw-cache', 'wfs-cache', 'feature-cache' ],
    connection = require('nano')(config.dbHost),
    
    updateDoc = require('./updateDoc'),         // function (db, docId, document, callback)
    parseFeatures = require('./parseFeatures'); // function (wfsDb, featureDb, wfsId, callback)

function hashUrl(url) {
    var hash = crypto.createHash('sha256');
    hash.update(decodeURIComponent(url).toUpperCase());
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
                requestUrl: decodeURIComponent(wfsRequestUrl),
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
    },
    
    cacheCsw: function (cswRequestUrl, content, callback) {
        var cswResponseString = content.response,
            title = content.title || '',
            abstract = content.abstract || '',
            keywords = content.keywords || [];
        
        var parsedUrl = url.parse(cswRequestUrl, true, true),
            
            doc = {
                requestUrl: decodeURIComponent(cswRequestUrl),
                requestType: parsedUrl.query.request,
                response: cswResponseString
            },
            
            docId = hashUrl(cswRequestUrl);
        
        updateDoc(connection.db.use('csw-cache'), docId, doc, callback);
    },
    
    setup: function (callback) {
        require('./makeDbs')(connection, dbNames, function (err) {
            if (err) { callback(err); return; }
            require('./feature-cache').setup(function (err) {
                if (err) { callback(err); return; }
                require('./csw-cache').setup(function (err) {
                    if (err) { callback(err); return; }
                    callback(null, null);
                });
            });
        });
    }
};

_.each(dbNames, function (dbName) {
    couch.dbs[dbName] = couch.connection.use(dbName);    
});

module.exports = couch;