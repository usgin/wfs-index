var expat = require('node-expat'),
    _ = require('underscore'),
    Distribution = require('./distribution'),
    cacheControl = require('./cacheControl');

module.exports = function (recordId, callback) {
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
        thisUrl = '',
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
            thisUrl += text;
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
            thisDistribution.addUrl(thisUrl);
            thisUrl = '';
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