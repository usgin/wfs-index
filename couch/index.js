var crypto = require('crypto'),
    url = require('url'),
    
    nano = require('nano'),
    _ = require('underscore'),
    
    config = require('../configuration'),
    
    dbNames = [ 'csw-cache', 'wfs-cache', 'feature-cache', 'cache-logs', 'cluster-cache' ],
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
    
    setup: function (callback) {
        var dbSetups = [
            require('./feature-cache').setup,
            require('./csw-cache').setup,
            require('./cache-logs').setup,
            require('./cluster-cache').setup
        ];
        
        function nextSetup(err) {
            if (err) { callback(err); return; }
            if (dbSetups.length > 0) {
                dbSetups.pop()(nextSetup);
            } else {
                callback(null, null);
            }
        }
        
        require('./makeDbs')(connection, dbNames, nextSetup);
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
    
    writeLog: function (logType, content, callback) {
        var db = connection.db.use('cache-logs'),
            doc = {
                type: logType,
                dateTime: new Date().toISOString()
            };
        
        content = _.isObject(content) ? content : { message: content };
        if (!content.hasOwnProperty('message')) {
            content.message = '';
        }
        
        _.extend(doc, content);
        
        if (logType === 'job' || logType === 'message') {
            updateDoc(db, null, doc, callback);
        } else {
            callback(new Error('Invalid log type was specified'));
        }
    }
};

_.each(dbNames, function (dbName) {
    couch.dbs[dbName] = couch.connection.use(dbName);    
});

module.exports = couch;