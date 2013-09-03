var byLogType = function (doc) {
    emit(doc.type, 1);
};

var byLogTypeReduce = function (keys, values) {
    return sum(values);
};

var byJob = function (doc) {
    if (doc.type === 'message') {
        emit(doc.job, {
            status: doc.status || 'UNKNOWN',
            message: doc.message,
            time: doc.dateTime
        });
    }
};

module.exports = {
    '_id': '_design/internal',
    
    language: 'javascript',
    
    views: {
        byLogType: {
            map: byLogType.toString(),
            reduce: byLogTypeReduce.toString()
        },
        
        byJob: {
            map: byJob.toString()
        }
    }
};