var assert = require('assert');

module.exports = {
    'The indexFeatures executable': {
        topic: function () {
            return require('../bin/indexFeatures');    
        },
        'can be run': {
            topic: function (indexFeatures) {
                indexFeatures('http://localhost:8000/', 'aasg:Wellheader', 'wellHeader', this.callback);    
            },
            'successfully': function (err, result) {
                assert.isNull(err);
            }
        }
    }
}