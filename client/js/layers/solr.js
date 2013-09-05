app.layers.Solr = L.GeoJSON.extend({
    
    initialize: function (solrUrl, options) {
        this._solrUrl = solrUrl + '/select?q=*:*&wt=json&rows=10000000&fq=';
        L.GeoJSON.prototype.initialize.call(this, null, options);
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
                self.addData(data);
            }
        });
    },
    
    onAdd: function (map) {
        map.on('moveend', this.requestData, this);
        map.on('zoomend', this.requestData, this);
        L.LayerGroup.prototype.onAdd.call(this, map);
        this.requestData({ target: map });
    },
    
    onRemove: function (map) {
        map.off('moveend', this.requestData);
        map.off('zoomend', this.requestData);
        L.LayerGroup.prototype.onRemove.call(this, map);
    }
});

app.layers.solr = function (solrUrl, coreName, options) {
    return new app.layers.Solr(solrUrl, coreName, options);
};
