var _ = require('underscore');

module.exports = function (callback) {
    var allIds = [],
        wfsUrls = [],
        recordsPerReq = 10,
        betweenRequests = 3000,             // ms
        self = this;
    
    function requestRecords(ids) {
        if (ids.length === 0) { callback(null, wfsUrls); return; }
        
        setTimeout(
            function () {
                self.getRecordById(ids.pop(), function (err, someWfsUrls) {
                    wfsUrls = _.union(wfsUrls, someWfsUrls);
                    
                    requestRecords(ids);
                });
            }, 
            
            betweenRequests
        );
    }
    
    function paginateRecords(err, next, total, ids) {
        allIds = _.union(allIds, ids);
        
        if (next === 0 || next >= total) {
            requestRecords(allIds);
            return; 
        }
        
        setTimeout(
            function () {
                self.getRecords(next, recordsPerReq, paginateRecords);
            },
            
            betweenRequests
        );
    }
    
    paginateRecords(null, 1, 100, []);
};