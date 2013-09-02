var fs = require('fs'),
    path = require('path'),
    
    _ = require('underscore'),
    
    here = path.dirname(__filename),
    files = fs.readdirSync(here),
    pairs = [];

_.each(files, function (filename) {
    if (filename !== 'index.js') {
        var key = filename.replace('.js', '');
        pairs.push([key, require('./' + key).toString()]);
    }
});

module.exports = _.object(pairs);