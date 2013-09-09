var updateDoc = require('../updateDoc'),    // function (db, docId, document, callback)
    clusterLayer = require('./clusterLayer');

module.exports = function (db, callback) {
    updateDoc(db, clusterLayer._id, clusterLayer, callback);
};