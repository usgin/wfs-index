var spawn = require('child_process').spawn,
    events = require('events');

function Wfs2GeoJSON() {
    var self = this,
        params = ["-f", "GeoJSON", "-preserve_fid", "-skipfailures", "/vsistdout/", "/vsistdin/"],
        ogr = spawn("ogr2ogr", params);

    events.EventEmitter.call(this);
    
    this.input = ogr.stdin;
    this.error = ogr.stderr;
    
    this.input.on("error", function (err) {
        console.log("error in input stream");    
    });
    
    this.input.on("pipe", function () {
        self.output = ogr.stdout;  
        self.output.on("error", function (err) {
            console.log("error in output stream");    
        });
        self.emit("outputReady");
    });
}

Wfs2GeoJSON.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = Wfs2GeoJSON;