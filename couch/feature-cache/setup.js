var updateDoc = require('../updateDoc'),    // function (db, docId, document, callback)
    internal = require('./internal');

module.exports = function (db, callback) {
    updateDoc(db, internal._id, internal, callback);
};