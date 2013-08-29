// Generates a Solr index doc from a GeoJSON representation of a ThermalSprings feature
module.exports = function (feature) {
    var props = feature.properties || {};

    return {
        id: props.ThermalSpringsURI,
        content_model: 'http://stategeothermaldata.org/uri-gin/aasg/xmlschema/thermalspring/1.8',
        url: props.ThermalSpringsURI,
        springname_t: props.SpringName,
        label_t: props.Label,
        othername_t: props.OtherName,
        otheridentifier_t: props.OtherIdentifier,
        description_t: props.description
    }
};