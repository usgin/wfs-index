module.exports = function (feature) {
    var props = feature.properties || {};
    if (props.hasOwnProperty('HeaderURI') && props.hasOwnProperty('LeaseName') && props.hasOwnProperty('Driller')) {
        var result = {
            id: props.HeaderURI,
            content_model: 'http://stategeothermaldata.org/uri-gin/aasg/xmlschema/wellheader/1.5',
            url: props.HeaderURI,
            wellname_t: props.WellName,
            apino_t: props.APINo,
            label_t: props.Label,
            description_t: props.Notes,
            geo: feature.geometry.coordinates[0] + ' ' + feature.geometry.coordinates[1]
        }
        
        emit(feature.wfsDocId, result);
    }
};