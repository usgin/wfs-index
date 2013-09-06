var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    
    clustering = require('../clustering'),
    testData = require('../testData'),
    
    data;

module.exports = {
    'The Clustering module': {
        topic: function () {
            var cb = this.callback;
            fs.readFile(path.resolve(path.dirname(__filename), '..', 'testData', 'featureCollection.geojson'), function (err, content) {
                data = JSON.parse(content);
                cb(null, null);
            });
        },
        'can be run': {
            topic: function () {
                clustering.cluster(data, 8, this.callback);
            },
            'returns the expected features': function (err, result) {
                assert.equal(JSON.stringify(result), testData.clusteredAt8)
            },
            'sequentially': {
                topic: function () {
                    clustering.cluster(data, 10, this.callback);
                },
                'returns the expected features': function (err, result) {
                    assert.equal(JSON.stringify(result), testData.clusteredAt10)
                },
                'and sequentially': {
                    topic: function () {
                        clustering.cluster(data, 6, this.callback);
                    },
                    'returns the expected features': function (err, result) {                        
                        assert.equal(JSON.stringify(result), testData.clusteredAt6)
                    },
                }
            },
            'in parallel': {
                topic: function () {
                    clustering.cluster(data, 7, this.callback);    
                },
                'returns the expected features': function (err, result) {
                    assert.equal(JSON.stringify(result), testData.clusteredAt7);    
                }
            }
        },
        'can cluster a range of zoom levels': {
            topic: function () {
                clustering.clusterRange(data, [5, 6, 7, 8], this.callback);    
            },
            'returns the expected set of clustered features': function (err, result) {
                assert.equal(JSON.stringify(result), testData.clusterCollection);
            }
        }
    }
};