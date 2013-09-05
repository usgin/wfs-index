app.layers.SolrClustered = L.MarkerClusterGroup.extend({
    initialize: function (solrUrl, options) {
        this._solrUrl = solrUrl + '/select?q=*:*&wt=json&rows=10000000&fq=';
        
        _.extend(options, {
            showCoverageOnHover: false,
            
            iconCreateFunction: function (cluster) {
                var childCount = cluster.getChildCount();
                
                return new L.DivIcon({
                    html: '<div><span>' + childCount + '</span></div>',
                    className: 'marker-cluster marker-cluster-custom',
                    iconSize: new L.Point(40, 40)
                });
            }
        });
        
        this.on('clustermouseover', this.showClusterDetails, this);
        this.on('clustermouseout', this.hideClusterDetails, this);
        
        L.MarkerClusterGroup.prototype.initialize.call(this, options);
    },
    
    requestData: function (evt) {
        var self = this,
            bounds = evt.target.getBounds().toBBoxString().split(','),
            fq = 'geo:[' + bounds[1] + ',' + bounds[0] + ' TO ' + bounds[3] + ',' + bounds[2] + ']',
            url = this._solrUrl + fq;
        
        d3.json(url, function (err, json) {
            if (!err) {
                var data = _.map(json.response.docs, function (doc) {
                    return {
                        type: "Feature",
                        properties: _.omit(doc, 'geojson', 'geo', '_version_'),
                        geometry: JSON.parse(doc.geojson)
                    }
                });
                
                self.clearLayers();
                self.addLayer(L.geoJson(data, self.options));
            }
        });
    },
    
    onAdd: function (map) {
        map.on('moveend', this.requestData, this);
        map.on('zoomend', this.requestData, this);
        L.MarkerClusterGroup.prototype.onAdd.call(this, map);
        this.requestData({ target: map });
    },
    
    onRemove: function (map) {
        map.off('moveend', this.requestData);
        map.off('zoomend', this.requestData);
        L.MarkerClusterGroup.prototype.onRemove.call(this, map);
    },
    
    _detailsVisble: false,
    
    showClusterDetails: function (evt) {
        if (!this._detailsVisible) {
            var types = _.map(evt.layer.getAllChildMarkers(), function(marker) {
                    return marker.feature.properties.content_model;
                }),
                
                reduced = _.reduce(types, function (memo, type) {
                    if (memo.hasOwnProperty(type)) {
                        memo[type]++;
                    } else {
                        memo[type] = 0;
                    }
                    return memo;
                }, {});
            
            console.log(reduced);
            
            this._detailsVisible = true;
        }
    },
    
    hideClusterDetails: function (evt) {
        if (this._detailsVisible) {
            this._detailsVisible = false;
        }
    }
    
});

app.layers.solrClustered = function (solrUrl, options) {
    return new app.layers.SolrClustered(solrUrl, options);
};