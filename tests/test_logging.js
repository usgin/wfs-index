var assert = require('assert'),
    
    logging = require('../logging'),
    couch = require('../couch'),
    
    jobId;

module.exports = {
    'can write a new job to the log': {
        topic: function () {
            logging.logJob('A fake harvesting job', 'http://not-real.com', this.callback);
        },
        'without error': function (err, id) {
            assert.isNull(err);
        },
        'and return a job id': {
            topic: function (id) {
                jobId = id;
                couch.dbs['cache-logs'].get(id, this.callback);
            },
            'for a doc that exists': function (err, doc) {
                assert.isNull(err);
            },
            'which can be used for a message': {
                topic: function (doc) {
                    logging.logMessage(doc._id, 'A fake log message', 'error', this.callback);
                },
                'which is created successfully': function (err, id) {
                    assert.isNull(err);
                },
                'and the log document': {
                    topic: function (id) {
                        couch.dbs['cache-logs'].get(id, this.callback);    
                    },
                    'exists': function (err, doc) {
                        assert.isNull(err);    
                    },
                    'has the right job designated': function (err, doc) {
                        assert.equal(doc.job, jobId);
                    }
                }
            }
        }
    }
}