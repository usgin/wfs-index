var request = require('request'),
    url = require('url'),
    qs = require('querystring'),
    crypto = require('crypto'),
    _ = require('underscore'),
    expat = require('node-expat'),
    fs = require('fs'),
    path = require('path'),
    Wfs2GeoJSON = require('./wfs2geojson');

function cachedFileName(inputUrl) {
    var hash = crypto.createHash('sha256');
    hash.update(inputUrl);
    return path.resolve(path.dirname(__filename), '..', 'cache', hash.digest('hex'));
}

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
    
    this.cachedCapabilitiesFile = cachedFileName(url.format(this.capabilitiesUrl));
    
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

    
    var cachedFile = this.cachedCapabilitiesFile;
    
    function readCachedFile() {
        var capabilitiesFile = fs.createReadStream(cachedFile);
        capabilitiesFile.pipe(parser);
    }

    if (!fs.exists(cachedFile)) {
        var cachedCapabilities = fs.createWriteStream(cachedFile),
            req = request(url.format(this.capabilitiesUrl));
        
        req.on('end', readCachedFile);
        req.pipe(cachedCapabilities);
    }
    
    else { readCachedFile(); }
};

/*
Need to handle errors in the stream -- what happens if the connection drops? Take ogr2ogr out of the http request pipeline.
*/
WFS.prototype.getAllFeatures = function (featuretype, callback) {
    var theUrl = url.format(this.getFeatureUrl(featuretype)),
        wfs2geojson = new Wfs2GeoJSON(),
        cachedFile = cachedFileName(theUrl),
        geojson = '';
    
    function readFromCache() {
        fs.readFile(cachedFile, function (err, geojson) {
            var features = [],
                error = err;
            
            try { features = JSON.parse(geojson).features; }
            catch (parseError) { error = parseError; }

            callback(error, features);
        });
    }
    
    if (!fs.existsSync(cachedFile)) {
        var cachedFeatures = fs.createWriteStream(cachedFile);
        wfs2geojson.on('outputReady', function () {
            wfs2geojson.output.on('end', readFromCache);
            wfs2geojson.output.pipe(cachedFeatures);
        });
        
        request(theUrl).pipe(wfs2geojson.input);
    }
    
    else { readFromCache(); }
};

module.exports = WFS;