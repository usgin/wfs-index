var _ = require('underscore');

function cluster(solrData, zoom, callback) {
    var L = require('./leaflet')(),
        
        map = L.map('map', {
            center: [38.543869175876154, -92.5433349609375],
            zoom: zoom,
            maxZoom: 10
        }),
        
        dataLayer = L.geoJson(solrData),
        clusterLayer = new L.MarkerClusterGroup();
    
    map.addLayer(clusterLayer);
    clusterLayer.addLayer(dataLayer);
    
    var features = _.map(clusterLayer._featureGroup.getLayers(), function (cluster) {
        var f = cluster.toGeoJSON(),
            types = _.map(cluster.__parent.getAllChildMarkers(), function(marker) {
                    return marker.feature.properties.content_model || 'unknown type';
                });
                
        f.properties = _.reduce(types, function (memo, type) {
            if (memo.hasOwnProperty(type)) {
                memo[type]++;
            } else {
                memo[type] = 0;
            }
            return memo;
        }, {});
        
        return f;
    });
    
    callback(null, features);    
}

module.exports = {
    cluster: cluster,
    
    clusterRange: function (solrData, range, callback) {
        // TODO: check that range is full of integers
        var i = 0,
            result = {};
        
        _.each(range, function(zoom) {
            function counter(err, clustered) {
                i++;
                result[zoom] = clustered;
                if (i === range.length) {
                    callback(null, result);
                }
            }
            
            cluster(solrData, zoom, counter);
        });
        
    }
};