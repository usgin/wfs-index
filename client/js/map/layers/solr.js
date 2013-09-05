var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#254ed6",
    color: "#254ed6",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.5
};

app.map.layers.solr = app.layers.solrClustered('/solr', {
    pointToLayer: function (f, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    
    onEachFeature: function (f, lyr) {
        var text = '<table class="table table-bordered table-striped">';
        
        _.each(_.keys(f.properties), function(propName) {
            text += '<tr><th>' + propName + '</th><td>' + f.properties[propName] + '</td></tr>';
        });
        
        text += '</table>';
        
        var popup = L.popup({ maxWidth: 500 });
        popup.setContent(text);
        lyr.bindPopup(popup);
    }
});

app.map.map.addLayer(app.map.layers.solr);