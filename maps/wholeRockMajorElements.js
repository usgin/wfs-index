module.exports = function (feature) {
    var props = feature.properties || {};
    if (props.hasOwnProperty('AnalysisURI') && props.hasOwnProperty('Al2O3_WtPct')) {
        var result = {
            id: props.AnalysisURI,
            content_model: 'http://stategeothermaldata.org/uri-gin/aasg/xmlschema/rockchemistry/0.4',
            url: props.AnalysisURI,
            label_t: props.Label,
            description_t: props.SpecimenDescription,
            geo: feature.geometry.coordinates[0] + ' ' + feature.geometry.coordinates[1]
        }
        
        emit(feature.wfsDocId, result);
    }
};