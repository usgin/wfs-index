var assert = require('assert'),
    request = require('request'),

    couch = require('../couch'),
    main = require('../main');

module.exports = {
    'The Main module': {
        topic: function () {
            var cb = this.callback;
            
            function couchSetup() {
                main.scrapeCsw({ cswUrl: 'http://localhost:8000/' }, cb);
            }
            
            function dbsPurged() {
                couch.setup(couchSetup);    
            }
            
            couch.purgeDbs(dbsPurged);
        },
        'does not fail': function (err, wfsUrls) {
            assert.isNull(err);    
        },
        'returns five WFS URLs': function (err, wfsUrls) {
            assert.equal(wfsUrls.length, 5);    
        },
        'caches one GetRecords response': {
            topic: function () {
                couch.dbs['csw-cache'].view('internal', 'byRequestType', { key: 'GetRecords' }, this.callback);    
            },
            'successfully': function (err, response) {
                if (response.rows.length > 0) {
                    assert.equal(response.rows[0].value, 1);
                } else {
                    assert(false, 'There were no GetRecords docs cached');
                }
            }
        },
        'caches six GetRecordById responses': {
            topic: function () {
                couch.dbs['csw-cache'].view('internal', 'byRequestType', { key: 'GetRecordById' }, this.callback);    
            },
            'successfully': function (err, response) {
                if (response.rows.length > 0) {
                    assert.equal(response.rows[0].value, 6);
                } else {
                    assert(false, 'There were no GetRecordById docs cached');
                }
            }
        }
    }
};