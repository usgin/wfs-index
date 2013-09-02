var assert = require('assert'),
    
    _ = require('underscore'),
    
    couch = require('../couch'),
    CSW = require('../csw'),
    testData = require('../testData');

module.exports = {
    'after loading a test GetRecords request': {
        topic: function () {
            couch.cacheCsw(testData.cswGetRecordsResponse.url, testData.cswGetRecordsResponse.response, this.callback);
        },
        'and asking for the cached results': {
            topic: function () {
                var csw = new CSW(testData.cswGetRecordsResponse.url);
                csw.getRecords(1, 10, this.callback);
            },
            'does not fail': function (err, next, total, ids) {
                assert.isNull(err);    
            },
            'returns a list of record ids': function (err, next, total, ids) {
                if (!err) { assert(ids.length === 10); }
            },
            'returns the expected next record number': function (err, next, total, ids) {
                assert.equal(next, 11);
            },
            'returns the expected total number of records': function (err, next, total, ids) {
                assert.equal(total, 19054);
            }
        }
    },
    'after loading a test GetRecordById request': {
        topic: function () {
            couch.cacheCsw(testData.cswGetRecordWithWfs.url, testData.cswGetRecordWithWfs.response, this.callback);
        },
        'and asking for the cached results': {
            topic: function () {
                var csw = new CSW(testData.cswGetRecordWithWfs.url);
                csw.getRecordById('ba2f0b9d21f71acfe10609f76e17d55a', this.callback);
            },
            'does not fail': function (err, wfsUrls) {
                assert.isNull(err);    
            },
            'returns a list of WFS URLs': function (err, wfsUrls) {
                if (!err) { assert(wfsUrls[0] === 'http://kgs.uky.edu/arcgis/services/aasggeothermal/ALBoreholeTemperatures/MapServer/WFSServer?request=GetCapabilities&service=WFS'); }
            }
        }
    }
};