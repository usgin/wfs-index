var spawn = require('child_process').spawn,
    events = require('events');

module.exports = function Wfs2GeoJSON(wfsFeaturesString, callback) {
    var geojson = '', error = '',
        params = ["-f", "GeoJSON", "-preserve_fid", "-skipfailures", "/vsistdout/", "/vsistdin/"],
        ogr = spawn("ogr2ogr", params);
    
    ogr.stdout.on('data', function (chunk) {
        geojson += chunk;    
    });
    
    ogr.stdout.on('end', function () {
        var err, result;
        
        try {
            result = JSON.parse(geojson).features || [];
        } catch (oops) {
            err = oops;
        }
        
        callback(err, result);    
    });
    
    ogr.stdout.on('error', function (err) {
        callback(err);    
    });
    
    ogr.stdin.write(wfsFeaturesString);
    
    ogr.stdin.end();
};