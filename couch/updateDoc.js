var _ = require('underscore');

module.exports = function (db, docId, document, callback) {
    if (!docId) { db.insert(document, callback); return; }
    
    function checkedForExistingDoc(err, response) {
        if (err && err.status_code !== 404) { callback(err); return; }
        
        var doc = response || {};
        
        _.extend(doc, document);
        
        db.insert(doc, docId, callback);
    }
    
    db.get(docId, checkedForExistingDoc);
};