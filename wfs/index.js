var request = require('request'),
    url = require('url'),
    qs = require('querystring'),
    
    _ = require('underscore'),
    expat = require('node-expat'),
    
    couch = require('../couch');

function WFS(wfsUrl, wfsVersion) {
    if (!wfsUrl) { throw new Error('A wfsUrl must be specified'); }
    
    var parsedBaseUrl = url.parse(wfsUrl, true, true);
    
    this.baseUrl = url.format({
        protocol: parsedBaseUrl.protocol,
        host: parsedBaseUrl.host,
        auth: parsedBaseUrl.auth,
        pathname: parsedBaseUrl.pathname
    });
    
    this.capabilitiesUrl = this.baseUrl + '?' + qs.stringify({
        service: 'WFS',
        version: wfsVersion,
        request: 'GetCapabilities'
    });
    
    this.wfsVersion = wfsVersion || '1.0.0';
}

WFS.prototype.getFeatureUrl = function (featuretype, maxfeatures, outputformat) {
    if (!featuretype) { throw new Error('A featuretype must be specified'); }

    var query = {
        service: 'WFS',
        version: this.wfsVersion,
        request: 'GetFeature',
        typeName: featuretype
    };

    if (outputformat) { query.outputFormat = outputformat; }
    if (maxfeatures) { query.maxFeatures = maxfeatures; }

    return this.baseUrl + '?' + qs.stringify(query);
};

/*
Need to add support for recognizing when I'm parsing an ows:ExceptionReport
*/
WFS.prototype.listFeatureTypes = function (callback) {
    var parser = new expat.Parser('UTF-8'),
        featureTypes = [],
        inType = false,
        inName = false;

    parser.on('startElement', function (name, attrs) {
        if (_.contains(['wfs:FeatureType', 'FeatureType'], name)) {
            inType = true;
        } else if (inType && _.contains(['wfs:Name', 'Name'], name)) {
            inName = true;
        }
    });

    parser.on('text', function (text) {
        if (inName) {
            featureTypes.push(text);
        }
    });

    parser.on('endElement', function (name) {
        if (name === 'wfs:FeatureType' || name === 'FeatureType') {
            inType = false;
        } else if (inType && _.contains(['wfs:Name', 'Name'], name)) {
            inName = false;
        }
    });

    parser.on('end', function () {
        callback(null, featureTypes);
    });

    parser.on('error', function (err) {
        callback(err);
    });

    request(url.format(this.capabilitiesUrl)).pipe(parser);
};

WFS.prototype.getAllFeatures = function (featuretype, callback) {
    var getFeatureUrl = url.format(this.getFeatureUrl(featuretype)),
        wfsDocId = couch.url2Id(getFeatureUrl);
    
    function cachedWfs(err, response) {
        if (err) { callback(err); return; }
        
        couch.cacheFeatures(getFeatureUrl, callback); // function (wfsRequestUrl, callback)
    }
    
    function gotWfsResponse(err, response, body) {
        if (err) { callback(err); return; }
        
        couch.cacheWfs(getFeatureUrl, body, cachedWfs); // function (wfsRequestUrl, wfsResponseString, callback)
    }
    
    function checkCache(err, doc) {
        if (err && err.status_code !== 404) { callback(err); return; }
        
        if (doc) { cachedWfs(null, null); return; } // callback(null, doc._id)
        
        request(getFeatureUrl, gotWfsResponse);  
    }
    
    couch.dbs['wfs-cache'].get(wfsDocId, checkCache);
};

module.exports = WFS;