var byWfsDocId = function (doc) {
    emit(doc.wfsDocId, 1);
};

var data = function (doc) {
    emit(doc.wfsDocId, doc);    
};

var byWfsDocIdReduce = function (keys, values) {
    return sum(values);
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
    '_id': '_design/internal',
    
    language: 'javascript',
    
    views: {
        byWfsDocId: {
            map: byWfsDocId.toString(),
            reduce: byWfsDocIdReduce.toString()
        },
        
        data: {
            map: data.toString()    
        }
    },
    
    lists: {
        featureCollection: featureCollection.toString()
    }
};