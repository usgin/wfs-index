var byWfsDocId = function (doc) {
    emit(doc.wfsDocId, 1);
};

var byWfsDocIdReduce = function (keys, values) {
    return sum(values);
};

module.exports = {
    '_id': '_design/internal',
    
    language: 'javascript',
    
    views: {
        byWfsDocId: {
            map: byWfsDocId.toString(),
            reduce: byWfsDocIdReduce.toString()
        }
    }
};