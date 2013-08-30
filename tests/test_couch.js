var vows = require('vows'),
    assert = require('assert'),
    _ = require('underscore'),
    couch = require('../couch'),
    featureCache = require('../couch/feature-cache'),
    testData = require('../testData');

vows.describe('The CouchDB Module').addBatch({
    'when asked to purge the databases': {
        topic: function () {
            couch.purgeDbs(this.callback);
        },
        'leaves': {
            topic: function () {
                couch.connection.db.list(this.callback);
            },
            'nothing behind': function (err, result) {
                var count = 0;
                _.each(couch.dbNames, function (dbName) {
                    if (_.contains(result, dbName)) {
                        count++;
                    }
                });
                
                assert.equal(count, 0);
            }
        },
        'and then re-create them': {
            topic: function () {
                couch.makeDbs(this.callback);
            },
            'puts': {
                topic: function () {
                    couch.connection.db.list(this.callback);
                },
                'the right databases in place': function (err, result) {
                    var count = 0;
                    _.each(couch.dbNames, function (dbName) {
                        if (_.contains(result, dbName)) {
                            count++;
                        }
                    });
                    
                    assert.equal(count, couch.dbNames.length);
                }
            },
            'can update feature-cache design docs': {
                topic: function () {
                    featureCache.setup(this.callback);
                },
                'without failing': function (err, response) {
                    assert.isNull(err);    
                },
                'then cache a WFS response and': {
                    topic: function () {
                        couch.cacheWfs(testData.wfsResponse.url, testData.wfsResponse.response, this.callback);
                    },
                    'not fail': function (err, response) {
                        assert.isNull(err);
                    },
                    'create the expected doc': {
                        topic: function () {
                            couch.connection.use('wfs-cache').get(couch.url2Id(testData.wfsResponse.url), this.callback);
                        },
                        'without error': function (err, doc) {
                            assert.isNull(err);
                        },
                        'and it looks right': function (err, doc) {
                            assert.equal(doc.response, testData.wfsResponse.response);  
                        }
                    },
                    'then cache features': {
                        topic: function () {
                            couch.cacheFeatures(testData.wfsResponse.url, this.callback);
                        },
                        'without failing': function (err) {
                            assert.isNull(err);    
                        },
                        'creates': {
                            topic: function () {
                                couch.dbs['feature-cache'].view(
                                    'internal', 'byWfsDocId', 
                                    { key: couch.url2Id(testData.wfsResponse.url) }, 
                                    this.callback
                                );
                            },
                            'the right number of features': function (err, response) {
                                assert.equal(response.rows[0].value, 10);
                            }
                        }
                    }
                }
            }
        }
    }
}).export(module);