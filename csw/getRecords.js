var expat = require('node-expat'),
    _ = require('underscore'),
    
    cacheControl = require('./cacheControl');

module.exports = function (start, limit, callback) {
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
        } else if (inFileId && _.contains(stringEleName, name)) {
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