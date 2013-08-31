var fs = require('fs'),
    path = require('path'),
    here = path.dirname(__filename);

module.exports = {
    wfsResponse: {
        url: 'http://data.usgin.org/arizona/azgs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=azgs:earthquakedata&maxFeatures=10',
        response: fs.readFileSync(path.join(here, 'wfsResponse.xml')).toString()
    },
    
    cswGetRecordsResponse: {
        url: 'http://catalog.stategeothermaldata.org/geoportal/csw?request=GetRecords&service=CSW&version=2.0.2&typenames=csw:Record&outputSchema=http://www.isotc211.org/2005/gmd&maxrecords=10&elementsetname=brief&resulttype=results',
        response: fs.readFileSync(path.join(here, 'cswGetRecords.xml')).toString()
    },
    
    cswGetRecordWithWfs: {
        url: 'http://catalog.stategeothermaldata.org/geoportal/csw?request=GetRecordById&service=CSW&version=2.0.2&typenames=csw:Record&outputSchema=http://www.isotc211.oe=full&id=ba2f0b9d21f71acfe10609f76e17d55a',
        response: fs.readFileSync(path.join(here, 'cswGetRecordById_withWfs.xml')).toString()
    },
    
    cswGetRecordNoWfs: {
        url: 'http://catalog.stategeothermaldata.org/geoportal/csw?request=GetRecordById&service=CSW&version=2.0.2&typenames=csw:Record&outputSchema=http://www.isotc211.org/2005/gmd&elementsetname=full&id=50ec3aefb656b70647f32e38bc92c514',
        response: fs.readFileSync(path.join(here, 'cswGetRecordById_noWfs.xml')).toString()
    }
};
