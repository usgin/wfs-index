var assert = require('assert'),
    request = require('request'),

    couch = require('../couch'),
    scrapeCsw = require('../main');

module.exports = {
    'The Main module': {
        topic: function () {
            var cb = this.callback;
            
            function couchSetup() {
                scrapeCsw({ cswUrl: 'http://localhost:8000/', featureType: 'aasg:WRMajorElements' }, cb);
            }
            
            function dbsPurged() {
                couch.setup(couchSetup);    
            }
            
            couch.purgeDbs(dbsPurged);
        },
        'does not fail': function (err, wfsUrls) {
            assert.isNull(err);    
        },
        'returns one successful WFS': function (err, wfsSet, rejects, errors) {
            assert.equal(wfsSet.length, 1);
        },
        'returns four rejected WFS': function (err, wfsSet, rejects, errors) {
            assert.equal(rejects.length, 4);
        },
        'returns no errored WFS': function (err, wfsSet, rejects, errors) {
            assert.equal(errors.length, 0);
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
        },
        'caches 2612 GeoJSON features': {
            topic: function () {
                couch.dbs['feature-cache'].view(
                    'internal', 
                    'byWfsDocId', 
                    { key: 'b241f416d8603a67db5d2c4f24db14d27e67e397dfbd4fdcc64899acd1f293d5' },
                    this.callback
                );
            },
            'successfully': function (err, response) {
                if (response.rows.length > 0) {
                    assert.equal(response.rows[0].value, 2612)
                } else {
                    assert(false, 'No features were cached');
                }
            }
        }
    }
};