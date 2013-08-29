var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    here = path.dirname(__filename);

function deleteAFile(filename, callback) {
    callback = callback || function () {};
    filename = path.join(here, filename);
        
    if (fs.existsSync(filename)) {
        fs.unlink(filename, callback);
    } else {
        callback(new Error('File does not exist'));
    }
}

module.exports = {
    purge: function (callback) {
        callback = callback || function () {};
        
        fs.readdir(here, function (err, filenames) {
            var i = 0;
            
            function counter() {
                i++;
                if (i === filenames.length - 2) {
                    callback(null);    
                }
            }
            
            _.each(filenames, function (filename) {
                if (filename !== 'index.js') {
                    deleteAFile(filename, counter);
                } else {
                    counter();
                }
            });
        });
    },
    
    clear: deleteAFile 
};