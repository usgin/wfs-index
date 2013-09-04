// WARNING: Blocking code in here.

var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    
    here = path.dirname(__filename),
    pycswFolder = path.resolve(here, '..', 'pycsw'),
    sample = fs.readFileSync(path.join(pycswFolder, 'default-sample.cfg')).toString(),
    
    server;

sample = sample.replace('home=/var/www/pycsw', 'home=' + pycswFolder);
sample = sample.replace('url=http://localhost/pycsw/csw.py', 'url=http://localhost:8000/');
sample = sample.replace(
    'database=sqlite:////var/www/pycsw/tests/suites/cite/data/records.db',
    'database=sqlite:///' + path.join(here, 'records.db')
);

fs.writeFileSync(path.join(here, 'default.cfg'), sample);
//fs.unlinkSync(path.join(here, 'records.db'));

module.exports = {
    setupDb: function (callback) {
        callback = callback || function () {};
        
        var params = [
                path.join(pycswFolder, 'sbin', 'pycsw-admin.py'),
                '-c', 'setup_db',
                '-f', path.join(here, 'default.cfg')
            ],
        
            setup = spawn('python', params);
        
        setup.on('exit', callback);
    },
    
    loadSamples: function (callback) {
        callback = callback || function ()  {};
        
        var params = [
                path.join(pycswFolder, 'sbin', 'pycsw-admin.py'),
                '-c', 'load_records',
                '-f', path.join(here, 'default.cfg'),
                '-p', path.join(here, 'sampleMetadata')
            ],
            
            loader = spawn('python', params);
        
        loader.on('exit', callback);
    },
    
    start: function (callback) {
        callback = callback || function () {};
        
        var options = { env: process.env };
        options.env.PYCSW_CONFIG = path.join(here, 'default.cfg');
        
        server = spawn('python', [ path.join(pycswFolder, 'csw.wsgi') ], options);
        
        //server.stdout.pipe(process.stdout);
        //server.stderr.pipe(process.stderr);
        
        callback();
    },
    
    stop: function (callback) {
        callback = callback || function () {};
        
        server.on('exit', callback);
        
        server.kill();
    }
};