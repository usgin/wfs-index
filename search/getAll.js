module.exports = function (client, callback) {
    callback = callback || function () {};

    var query = client.createQuery();
    query
        .q({'*': '*'})
        .start(0)
        .rows(1000000000);
    
    client.search(query, callback);
};