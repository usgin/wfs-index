var couch = require('../couch');

module.exports = {
    logJob: function (name, url, callback) {
        couch.writeLog('job', { name: name, url: url }, function (err, response) {
            callback(err, response.id);    
        });    
    },
    
    logMessage: function (job, message, status, callback) {
        couch.writeLog('message', { job: job, message: message, status: status }, function (err, response) {
            callback(err, response.id);     
        });
    }
};