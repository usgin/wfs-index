var fs = require('fs'),
    request = require('request'),
    _ = require('underscore');

request('http://localhost:8983/solr/select?q=*:*&wt=json&rows=10000000&fq=geo:[34.298068350990846,-99.07470703125%20TO%2042.56117285531808,-86.011962890625]', function (err, response, body) {
    var result = JSON.parse(body),
        data = _.map(result.response.docs, function (doc) {
            return {
                type: "Feature",
                properties: _.omit(doc, 'geojson', 'geo', '_version_'),
                geometry: JSON.parse(doc.geojson)
            }
        });
    
    _.each([0,1,2,3,4,5,6,7,8,9], function (i) {
        var L = require('./leaflet'),
            
            dataLayer = L.geoJson(data, {}),
            clusterLayer = new L.MarkerClusterGroup(),
            mapOptions = { center: [38.543869175876154, -92.5433349609375], zoom: i, maxZoom: 10 },
            map = L.map('map-' + i, mapOptions);
        
        map.addLayer(clusterLayer);
        clusterLayer.addLayer(dataLayer);
        
        var features = _.map(clusterLayer._featureGroup.getLayers(), function (cluster) {
            var f = cluster.toGeoJSON(),
            
                types = _.map(cluster.__parent.getAllChildMarkers(), function(marker) {
                    return marker.feature.properties.content_model;
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
        
        var featureCollection = {
            type: "FeatureCollection",
            features: features
        };
        
        fs.writeFile('clustering/export-' + i + '.geojson', JSON.stringify(featureCollection));
    });
});