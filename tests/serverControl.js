var assert = require('assert'),
    
    server = require('../testCswServer');

module.exports = {
    start: {
        'Start the test CSW Server': {
            topic: function () {
                var cb = this.callback;
                
                function startingServer() {
                    setTimeout(cb, 2000);
                }
                
                function samplesLoaded() {
                    server.start(startingServer);    
                }
                
                function dbSetup () {
                    server.loadSamples(samplesLoaded);    
                }
                
                server.setupDb(dbSetup);
            },
            'successfully': function () {
                assert(true);
            }
        }
    },
    
    stop: {
        'Stop the test CSW Server': {
            topic: function () {
                server.stop(this.callback);
            },
            'successfully': function (code, signal) {
                assert.equal(signal, 'SIGTERM');    
            }
        }
    }
}