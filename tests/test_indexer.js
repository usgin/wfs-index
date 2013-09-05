var assert = require('assert');

module.exports = {
    'The Indexer': {
        topic: function () {
            return require('../indexer');    
        },
        'can addDocs': {
            topic: function (indexer) {
                indexer.addToIndex('wholeRockMajorElements', this.callback);
            },
            'without error': function (err, response, anything) {
                assert.isNull(err);    
            }
        }
    }
}