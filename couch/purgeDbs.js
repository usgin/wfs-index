var _ = require('underscore');

module.exports = function (connection, dbs, callback) {
    var i = 0;
    
    callback = callback || function () {};
    
    function counter() {
        i++;
        if (i === dbs.length) { callback(null); }
    }
    
    function dbDeleted(err, response) {
        if (err && err.status_code !== 404) { callback(err); }
        counter();
    }
    
    _.each(dbs, function (db) {
        connection.db.destroy(db, dbDeleted);
    });
};