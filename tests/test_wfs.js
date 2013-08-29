var vows = require('vows'),
    assert = require('assert'),
    WFS = require('../wfs'),
    _ = require('underscore');

vows.describe('The WFS Module').addBatch({
    'after construction agains a know WFS 1.1.0 endpoint': {
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
        'and asked for features': {
            topic: function (wfs) {
                wfs.getAllFeatures('aasg:ThermalSpring', this.callback);
            },
            'does not fail': function (err, features) {
                assert.isNull(err);    
            },
            'returns some features': function (err, features) {
                assert(features.length > 0);
            }
        }
    },
    
    'after construction agains a know WFS 1.0.0 endpoint': {
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
        'and asked for features': {
            topic: function (wfs) {
                wfs.getAllFeatures('azgs:earthquakedata', this.callback);
            },
            'does not fail': function (err, features) {
                assert.isNull(err);    
            },
            'returns some features': function (err, features) {
                assert(features.length > 0);
            }
        }
    }
}).export(module);