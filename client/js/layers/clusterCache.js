app.layers.ClusterCache = L.GeoJSON.extend({
    initialize: function (options) {
        var self = this;
        
        L.GeoJSON.prototype.initialize.call(this, null, options);
        
        d3.json('url/for/cached-cluster.json', function (err, json) {
            self._data = json;
            self.zoomEnd();
        });
    },
    
    onAdd: function (map) {
        L.LayerGroup.prototype.onAdd.call(this, map);
        
        map.on('zoomend', this.zoomEnd, this);
        
        if (this._data) { this.zoomEnd(); }
    },
    
    onRemove: function (map) {
        map.off('zoomend', this.zoomEnd, this);
        
        L.LayerGroup.prototype.onRemove.call(this, map);
    },
    
    zoomEnd: function (evt) {
        if (this._data && this._map) {
            var zoom = this._map.getZoom();
            
            this.clearLayers();
            this.addData(this._data[zoom]);
        }
    }
});

app.layers.clusterCache = function (options) {
    return new app.layers.ClusterCache(options);
};