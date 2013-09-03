var url = require('url'),
    qs = require('querystring');

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
        outputSchema: 'http://www.isotc211.org/2005/gmd',
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
        outputSchema: 'http://www.isotc211.org/2005/gmd',
        elementSetName: 'full',
        id: recordId
    };

    return this.baseUrl + '?' + qs.stringify(query);
};

CSW.prototype.getRecords = require('./getRecords');         // function (start, limit, callback)

CSW.prototype.getRecordById = require('./getRecordById');   // function (recordId, callback)

CSW.prototype.harvest = require('./harvest');               // function (callback)

module.exports = CSW;