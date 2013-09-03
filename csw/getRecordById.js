var expat = require('node-expat'),
    _ = require('underscore'),
    Distribution = require('./distribution'),
    cacheControl = require('./cacheControl');

module.exports = function (recordId, callback) {
    var getRecordByIdUrl = this.getRecordByIdUrl(recordId),
        
        parser = new expat.Parser('UTF-8'),
        inUrl = false,
        urlEleName = ['gmd:URL', 'URL'],
        thisUrl = '',
        
        inDist = false,
        distEleName = ['gmd:CI_OnlineResource', 'CI_OnlineResource'],
        
        inProtocol = false,
        protEleName = ['gmd:protocol', 'protocol'],
        protocol = '',
    
        inCitation = false,
        citationEleName = ['gmd:citation', 'citation'],
        
        inTitle = false,
        titleEleName = ['gmd:title', 'title'],
        title = '',
        
        inAbstract = false,
        abstractEleName = ['gmd:abstract', 'abstract'],
        abstract = '',
        
        inKeyword = false,
        keywordEleName = ['gmd:keyword', 'keyword'],
        thisKeyword = '',
        keywords = [],
        
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
        } else if (_.contains(citationEleName, name)) {
            inCitation = true;
        } else if (inCitation && _.contains(titleEleName, name)) {
            inTitle = true;    
        } else if (_.contains(abstractEleName, name)) {
            inAbstract = true;    
        } else if (_.contains(keywordEleName, name)) {
            inKeyword = true;    
        }
    });

    parser.on('text', function (text) {
        if (inUrl) {
            thisUrl += text;
        } else if (inProtocol) {
            protocol += text;
        } else if (inTitle) {
            title += text;    
        } else if (inAbstract) {
            abstract += text;    
        } else if (inKeyword) {
            thisKeyword += text;
        }
    });

    parser.on('endElement', function (name) {
        if (inDist && _.contains(distEleName, name)) {
            inDist = false;
            if (thisDistribution.looksLikeWfs()) {
                wfsUrls.push(thisDistribution.url);
            }
        } else if (inUrl && _.contains(urlEleName, name)) {
            thisDistribution.addUrl(thisUrl.trim());
            thisUrl = '';
            inUrl = false;
        } else if (inProtocol && _.contains(protEleName, name)) {
            thisDistribution.addProtocol(protocol.trim());
            protocol = '';
            inProtocol = false;
        } else if (inCitation && _.contains(citationEleName, name)) {
            inCitation = false;    
        }else if (inTitle && _.contains(titleEleName, name)) {
            title = title.trim();
            inTitle = false;    
        } else if (inAbstract && _.contains(abstractEleName, name)) {
            abstract = abstract.trim();
            inAbstract = false;    
        } else if (inKeyword && _.contains(keywordEleName, name)) {
            keywords.push(thisKeyword.trim());
            thisKeyword = '';
            inKeyword = false;    
        }
    });

    parser.on('end', function () {
        callback(null, wfsUrls, title, abstract, keywords);
    });

    parser.on('error', function (err) {
        callback(err);
    });
    
    cacheControl(getRecordByIdUrl, parser, callback);
};