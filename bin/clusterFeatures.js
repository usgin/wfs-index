#!/usr/bin/env node

var search = require('../search'),
    couch = require('../couch'),
    clustering = require('../clustering'),
    
    _ = require('underscore');

function clusterFeatures(callback) {
    callback = callback || function () {};
    
    function gotClusters(err, result) {
        if (err) { callback(err); return; }
        
        var i = 0,
            errors = [];
        
        function counter(err, response) {
            i--;
            if (err) { errors.push(err); return; }
            if (i === 0) {
                errors = errors.length === 0 ? null: errors;
                callback(errors);
            }
        }
        
        _.each(_.keys(result), function (zoom) {
            i = i + result[zoom].length;
                
            var features = _.map(result[zoom], function (f) {
                f.zoom = zoom;
                couch.dbs['cluster-cache'].insert(f, counter);
            });        
        });
    }
    
    function gotSolrResults(err, result) {
        if (err) { callback(err); return; }
        
        var data = _.map(result.response.docs, function (doc) {
            return {
                type: "Feature",
                properties: _.omit(doc, 'geojson', 'geo', '_version_'),
                geometry: JSON.parse(doc.geojson)
            };
        });
        
        clustering.clusterRange(data, [0,1,2,3,4,5,6,7,8,9], gotClusters);
    }
    
    search.getAll(gotSolrResults);
}

if (require.main === module) {
    clusterFeatures();
} else {
    module.exports = clusterFeatures;
}