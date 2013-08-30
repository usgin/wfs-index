// ## An Example of an Index Generator
// 
// This function generates a Solr index document from a GeoJSON representation of a ThermalSprings feature
// Here we're presenting a relatively simple pattern that all such functions should follow:
// 
// - Define the function as `module.exports = function (feature) {...}`. This will allow the program to find the function and include it in CouchDB
// - The name of the file (striped of `.js`) will become the name of the "view" in CouchDB
// - This function is given one GeoJSON feature, and must return an object that represents the Solr index document for this feature
// - Once included in the database, the view will be accessible at http://localhost:5984/feature-cache/_design/forIndexes/_view/{{ filename }}
module.exports = function (feature) {
    // A GeoJSON objects stores attributes inside an object called `properties`
    var props = feature.properties || {};
    
    // It is important to include a condition limiting what should be indexed in this fashion.
    // In this case, features that contain a `ThermalSpringsURI` attribute will be indexed.
    if (props.hasOwnProperty('ThermalSpringsURI')) {
        // Build an object that represents the key/value pairs that Solr will index
        // These will become the fields that you can search the Solr index on
        return {
            // It is always important to include an ID value
            id: props.ThermalSpringsURI,
            // It is useful to include the identifier for the content model for NGDS purposes
            content_model: 'http://stategeothermaldata.org/uri-gin/aasg/xmlschema/thermalspring/1.8',
            // It is great if you can include a normative URL for this feature
            url: props.ThermalSpringsURI,
            // *_t fields will be indexed as text, and also added to the default full-text index field
            springname_t: props.SpringName,
            label_t: props.Label,
            othername_t: props.OtherName,
            otheridentifier_t: props.OtherIdentifier,
            description_t: props.description
        }
    }
};