var byZoom = function (doc) {
    emit(doc.zoom, {
        type: "Feature",
        properties: doc.properties,
        geometry: doc.geometry
    });
};

var featureCollection = function (head, req) {
    send('{"type": "FeatureCollection", "features": [');

    var row = getRow();
    
    if (row) { send(JSON.stringify(row.value)); }

    while (row = getRow()) {
        send(', ' + JSON.stringify(row.value));
    }
    
    send(']}');
};

module.exports = {
    '_id': '_design/clusterLayer',
    
    language: 'javascript',
    
    views: {
        byZoom: {
            map: byZoom.toString()
        }
    },
    
    lists: {
        featureCollection: featureCollection.toString()
    }
};