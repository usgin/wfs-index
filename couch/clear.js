var _ = require('underscore');

module.exports = function (db, callback) {
    callback = callback || function () {};
    
    db.list({ include_docs: true }, function (err, result) {
        if (err) { callback(err); return; }
        
        var docs = _.map(result.rows, function (row) {
            return _.extend({ _deleted: true }, row.doc);  
        });
        
        docs = _.reject(docs, function (doc) {
            return doc._id.indexOf('_design') === 0;    
        });
        
        db.bulk({docs: docs}, callback);
    });
};