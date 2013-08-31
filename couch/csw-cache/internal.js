var byRequestType = function (doc) {
    emit(doc.requestType, 1);
};

var byRequestTypeReduce = function (keys, values) {
    return sum(values);
};

module.exports = {
    '_id': '_design/internal',
    
    language: 'javascript',
    
    views: {
        byRequestType: {
            map: byRequestType.toString(),
            reduce: byRequestTypeReduce.toString()
        }
    }
};