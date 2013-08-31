var _ = require('underscore');

module.exports = function (callback) {
    var allIds = [],
        wfsUrls = [],
        recordsPerReq = 10,
        betweenRequests = 3000,             // ms                     
        getRecords = this.getRecords,       // function (start, limit, callback)
        getRecordById = this.getRecordById; // function (recordId, callback)
    
    function requestRecords(ids) {
        if (ids.length === 0) { callback(null, wfsUrls); return; }
        
        setTimeout(getRecordById(ids.pop(), function (err, someWfsUrls) {
            wfsUrls = _.union(wfsUrls, someWfsUrls);
            
            requestRecords(ids);
        }), betweenRequests);
    }
    
    function paginateRecords(err, next, total, ids) {
        if (next >= total) { requestRecords(null, allIds); return; }
        
        allIds = _.union(allIds, ids);
        
        setTimeout(getRecords(next, recordsPerReq, paginateRecords), betweenRequests);
    }
    
    paginateRecords(null, 1, 100, []);
};