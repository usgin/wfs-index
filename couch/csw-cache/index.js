var couch = require('../'),
    setup = require('./setup');     // function (db, callback)

module.exports = {
    setup: function (callback) {
        setup(couch.dbs['csw-cache'], callback);    
    }
};