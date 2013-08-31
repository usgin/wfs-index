var _ = require('underscore'),
    
    updateDoc = require('../updateDoc'),    // function (db, docId, document, callback)
    internal = require('./internal'),
    forIndexes = require('./forIndexes'),
    maps = require('../../maps');

_.each(_.keys(maps), function (indexName) {
    forIndexes.views[indexName] = {
        map: maps[indexName]
    };
});

module.exports = function (db, callback) {
    var i = 0;
    
    function counter() {
        i++;
        if (i === 2) {
            callback(null, null);    
        }
    }
    
    updateDoc(db, internal._id, internal, counter);
    updateDoc(db, forIndexes._id, forIndexes, counter);
};