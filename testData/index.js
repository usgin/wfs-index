var fs = require('fs'),
    path = require('path'),
    here = path.dirname(__filename);

module.exports = {
    wfsResponse: {
        url: 'http://data.usgin.org/arizona/azgs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=azgs:earthquakedata&maxFeatures=10',
        response: fs.readFileSync(path.join(here, 'wfsResponse.xml')).toString()
    }
};
