var _ = require('underscore'),
    Readable = require('stream').Readable,
    
    wfs2geojson = require('./wfs2geojson'),     // function (wfsFeaturesString, callback)
    updateDoc = require('./updateDoc');         // function (db, docId, document, callback)

module.exports = function (wfsDb, featureDb, wfsId, callback) {
    var i = 0, numberOfFeatures,
        errors = [];
    
    function counter(err, response) {
        if (err) { errors.push(err); }
        
        i++;
        
        if (i === numberOfFeatures) {
            if (errors.length > 0) {
                callback(errors);
            } else {
                callback(null, null);
            }
        }
    }
    
    function cacheFeature(feature) {
        _.extend(feature, { wfsDocId: wfsId });
        
        updateDoc(featureDb, null, feature, counter);
    }
    
    function gotFeatures(err, geojson) {
        if (err) { callback(err); return; }
        
        numberOfFeatures = geojson.length;
        
        _.each(geojson, cacheFeature);
    }
    
    function gotWfsResponse(err, wfsDoc) {
        if (err) { callback(err); return; }
        
        wfs2geojson(wfsDoc.response, gotFeatures);
    }
    
    wfsDb.get(wfsId, gotWfsResponse);
};