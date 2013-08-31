var request = require('request'),
    url = require('url'),
    qs = require('querystring'),
    
    _ = require('underscore'),
    expat = require('node-expat'),
    
    couch = require('../couch');

function CSW(cswUrl) {
    if (!cswUrl) { throw new Error('A cswUrl must be specified'); }
    
    var parsedBaseUrl = url.parse(cswUrl, true, true);
    
    this.baseUrl = url.format({
        protocol: parsedBaseUrl.protocol,
        host: parsedBaseUrl.host,
        auth: parsedBaseUrl.auth,
        pathname: parsedBaseUrl.pathname
    });
    
    this.capabilitiesUrl = this.baseUrl + '?' + qs.stringify({
        service: 'CSW',
        version: '2.0.2',
        request: 'GetCapabilities'
    });
}

CSW.prototype.getRecordsUrl = function (start, limit) {
    if (!start) { throw new Error('A start must be specified'); }

    var query = {
        service: 'CSW',
        version: '2.0.2',
        request: 'GetRecords',
        typeNames: 'gmd:MD_Metadata',
        outputSchema: 'http://isotc211.org/2005/gmd',
        elementSetName: 'brief',
        resultType: 'results',
        maxRecords: limit || 10,
        startPosition: start
    };

    return this.baseUrl + '?' + qs.stringify(query);
};

CSW.prototype.getRecordByIdUrl = function (recordId) {
    if (!recordId) { throw new Error('A start must be specified'); }
    
    var query = {
        service: 'CSW',
        version: '2.0.2',
        request: 'GetRecordById',
        typeNames: 'gmd:MD_Metadata',
        outputSchema: 'http://isotc211.org/2005/gmd',
        elementSetName: 'full',
        resultType: 'results',
        id: recordId
    };

    return this.baseUrl + '?' + qs.stringify(query);
};

function cacheControl(cswUrl, parser, callback) {
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
}

CSW.prototype.getRecords = function (start, limit, callback) {
    var getRecordsUrl = this.getRecordsUrl(start, limit),
        
        parser = new expat.Parser('UTF-8'),
        resultsEleName = ['csw:SearchResults', 'SearchResults'],
        fileIdEleName = ['gmd:fileIdentifier', 'fileIdentifier'],
        stringEleName = ['gco:CharacterString', 'CharacterString'],
        inFileId = false,
        inString = false,
        ids = [],
        next, total;
        
    parser.on('startElement', function (name, attrs) {
        if (_.contains(resultsEleName, name)) {
            next = Number(attrs.nextRecord);
            total = Number(attrs.numberOfRecordsMatched);
        } else if (_.contains(fileIdEleName, name)) {
            inFileId = true;
        } else if (_.contains(stringEleName, name)) {
            inString = true;
        }
    });

    parser.on('text', function (text) {
        if (inString) { ids.push(text); }
    });

    parser.on('endElement', function (name) {
        if (inFileId && _.contains(fileIdEleName, name)) {
            inFileId = false;
        } else if (inString && _.contains(stringEleName, name)) {
            inString = false;
        }
    });

    parser.on('end', function () {
        callback(null, next, total, ids);
    });

    parser.on('error', function (err) {
        callback(err);
    });
    
    cacheControl(getRecordsUrl, parser, callback);
};

function Distribution() {
    this.url = '';
    this.protocol = '';
}

Distribution.prototype.addUrl = function (url) {
    this.url = url;
};

Distribution.prototype.addProtocol = function (protocol) {
    this.protocol = protocol.toLowerCase();
};

Distribution.prototype.looksLikeWfs = function () {
    if (this.protocol.indexOf('wfs') !== -1) {
        return true;
    }
    
    var wfsGuessExpressions = [ /request=getcapabilities/i, /service=wfs/i ];
        
    return _.all(wfsGuessExpressions, function (expression) {
        return this.url.match(expression) !== null;
    });
};

CSW.prototype.getRecordById = function (recordId, callback) {
    var getRecordByIdUrl = this.getRecordByIdUrl(recordId),
        
        parser = new expat.Parser('UTF-8'),
        inUrl = false,
        inDist = false,
        inProtocol = false,
        inString = false,
        urlEleName = ['gmd:URL', 'URL'],
        distEleName = ['gmd:CI_OnlineResource', 'CI_OnlineResource'],
        protEleName = ['gmd:protocol', 'protocol'],
        stringEleName = ['gco:CharacterString', 'CharacterString'],
        fileIdEleName = ['gmd:fileIdentifier', 'fileIdentifier'],
        thisDistribution = null,
        wfsUrls = [];
    
    parser.on('startElement', function (name, attrs) {
        if (_.contains(distEleName, name)) {
            inDist = true;
            thisDistribution = new Distribution();
        } else if (inDist && _.contains(urlEleName, name)) {
            inUrl = true;
        } else if (inDist && _.contains(protEleName, name)) {
            inProtocol = true;
        } else if (inProtocol && _.contains(stringEleName, name)) {
            inString = true;
        }
    });

    parser.on('text', function (text) {
        if (inUrl) {
            thisDistribution.addUrl(text);
        } else if (inProtocol && inString) {
            thisDistribution.addProtocol(text);
        }
    });

    parser.on('endElement', function (name) {
        if (inDist && _.contains(distEleName, name)) {
            inDist = false;
            if (thisDistribution.looksLikeWfs()) {
                wfsUrls.push(thisDistribution.url);
            }
        } else if (inUrl && _.contains(urlEleName, name)) {
            inUrl = false;
        } else if (inProtocol && _.contains(protEleName, name)) {
            inProtocol = false;
        } else if (inString && _.contains(stringEleName, name)) {
            inString = false;
        }
    });

    parser.on('end', function () {
        callback(null, wfsUrls);
    });

    parser.on('error', function (err) {
        callback(err);
    });
    
    cacheControl(getRecordByIdUrl, parser, callback);
};

CSW.prototype.harvest = function (callback) {
    var allIds = [],
        wfsUrls = [],
        recordsPerReq = 10,
        betweenRequests = 3000,             // ms                     
        getRecords = this.getRecords,       // function (start, limit, callback)
        getRecordById = this.getRecordById; // function (recordId, callback)
    
    function requestRecords(ids) {
        if (ids.length === 0) { callback(null, wfsUrls); return; }
        
        setTimeout(getRecordById(ids.pop(), function (err, someWfsUrls) {
            wfsUrls = _.union(wfsUrls, someWfsUrls);
            
            requestRecords(ids);
        }), betweenRequests);
    }
    
    function paginateRecords(err, next, total, ids) {
        if (next >= total) { requestRecords(null, allIds); return; }
        
        allIds = _.union(allIds, ids);
        
        setTimeout(getRecords(next, recordsPerReq, paginateRecords), betweenRequests);
    }
    
    paginateRecords(null, 1, 100, []);
};

module.exports = CSW;