var _ = require('underscore');

module.exports = function (connection, dbs, callback) {
    var i = 0;
    
    callback = callback || function () {};
    
    function counter() {
        i++;
        if (i === dbs.length) { callback(null); }
    }
    
    function dbCreated(err, response) {
        if (err) { callback(err); return; }
        counter();
    }
    
    function dbsListed(err, dbNames) {
        if (err) { callback(err); return; }
        
        _.each(dbs, function (db) {
            if (!_.contains(dbNames, db)) {
                connection.db.create(db, dbCreated);
                return;
            }
            
            counter();
        });
    }
    
    connection.db.list(dbsListed);
};