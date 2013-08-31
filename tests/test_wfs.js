var vows = require('vows'),
    assert = require('assert'),
    _ = require('underscore'),
    
    WFS = require('../wfs'),
    couch = require('../couch'),

    wfs100GetFeatureUrl, wfs110GetFeatureUrl;

vows.describe('The WFS Module').addBatch({
    'after construction against a known WFS 1.1.0 endpoint': {
        topic: function () {
            var url = 'http://services.azgs.az.gov/ArcGIS/services/aasggeothermal/AKThermalSprings1_8/MapServer/WFSServer';
            return new WFS(url, '1.1.0');
        },
        'does not fail': function (wfs) {
            assert.isNotNull(wfs);
        },
        'and asked for a featuretype list': {
            topic: function (wfs) {
                wfs.listFeatureTypes(this.callback);
            },
            'does not fail': function (err, featuretypes) {
                assert.isNull(err);
            },
            'returns the expected featuretype': function (err, featuretypes) {
                assert.equal(featuretypes[0], 'aasg:ThermalSpring');
            }
        },
        'and asked to cache the WFS': {
            topic: function (wfs) {
                wfs110GetFeatureUrl = wfs.getFeatureUrl('aasg:ThermalSpring');
                wfs.getAllFeatures('aasg:ThermalSpring', this.callback);    
            },
            'does not fail': function (err, result) {
                assert.isNull(err);    
            },
            'creates a record in the wfs-cache': {
                topic: function () {
                    couch.dbs['wfs-cache'].get(couch.url2Id(wfs110GetFeatureUrl), this.callback)
                },
                'that exists': function (err, doc) {
                    assert.isNull(err);    
                },
                'and looks right': function (err, doc) {
                    assert.equal(doc.requestUrl, wfs110GetFeatureUrl);
                }
            },
            'creates records in the feature-cache': {
                topic: function () {
                    couch.dbs['feature-cache'].view(
                        'internal', 'byWfsDocId',
                        { key: couch.url2Id(wfs110GetFeatureUrl) },
                        this.callback
                    );
                },
                'and there is at least one of them': function (err, response) {
                    assert(response.rows[0].value > 0);
                }
            },
            'and then asked to do it again': {
                topic: function () {
                var url = 'http://services.azgs.az.gov/ArcGIS/services/aasggeothermal/AKThermalSprings1_8/MapServer/WFSServer',
                    wfs = new WFS(url, '1.1.0');
                wfs.getAllFeatures('aasg:ThermalSpring', this.callback);
                },
                'does not fail': function (err, result) {
                    assert.isNull(err);    
                }
            }
        }
    },
    
    'after construction against a known WFS 1.0.0 endpoint': {
        topic: function () {
            var url = 'http://data.usgin.org/arizona/ows';
            return new WFS(url, '1.0.0');
        },
        'does not fail': function (wfs) {
            assert.isNotNull(wfs);
        },
        'and asked for a featuretype list': {
            topic: function (wfs) {
                wfs.listFeatureTypes(this.callback);
            },
            'does not fail': function (err, featuretypes) {
                assert.isNull(err);
            },
            'returns one of the expected featuretypes': function (err, featuretypes) {
                assert(_.contains(featuretypes, 'azgs:earthquakedata'));
            }
        },
        'and asked to cache the WFS': {
            topic: function (wfs) {
                wfs100GetFeatureUrl = wfs.getFeatureUrl('azgs:earthquakedata');
                wfs.getAllFeatures('azgs:earthquakedata', this.callback);    
            },
            'does not fail': function (err, result) {
                assert.isNull(err);    
            },
            'creates a record in the wfs-cache': {
                topic: function () {
                    couch.dbs['wfs-cache'].get(couch.url2Id(wfs100GetFeatureUrl), this.callback)
                },
                'that exists': function (err, doc) {
                    assert.isNull(err);    
                },
                'and looks right': function (err, doc) {
                    assert.equal(doc.requestUrl, wfs100GetFeatureUrl);
                }
            },
            'creates records in the feature-cache': {
                topic: function () {
                    couch.dbs['feature-cache'].view(
                        'internal', 'byWfsDocId',
                        { key: couch.url2Id(wfs100GetFeatureUrl) },
                        this.callback
                    );
                },
                'and there is at least one of them': function (err, response) {
                    assert(response.rows[0].value > 0);
                }
            },
            'and then asked to do it again': {
                topic: function () {
                    var url = 'http://data.usgin.org/arizona/ows',
                        wfs = new WFS(url, '1.0.0');
                    wfs.getAllFeatures('azgs:earthquakedata', this.callback);
                },
                'does not fail': function (err, result) {
                    assert.isNull(err);    
                }
            }
        }
    }
}).export(module);