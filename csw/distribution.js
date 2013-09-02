var _ = require('underscore');

function Distribution() {
    this.url = '';
    this.protocol = '';
}
Distribution.prototype.addUrl = function (url) {
    this.url = url;
};

Distribution.prototype.addProtocol = function (protocol) {
    this.protocol = protocol.toLowerCase();
};

Distribution.prototype.looksLikeWfs = function () {
    if (this.protocol.indexOf('wfs') !== -1) {
        return true;
    }
    
    var wfsGuessExpressions = [ /request=getcapabilities/i, /service=wfs/i ],
        theUrl = this.url;
    
    return _.every(wfsGuessExpressions, function (expression) {
        return theUrl.match(expression) !== null;
    });
};

module.exports = Distribution;