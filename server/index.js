var express = require('express'),
    request = require('request'),
    qs = require('querystring'),
    path = require('path'),
    
    app = express();


app.get('/solr/:queryType', function (req, res) {
    request({
        url: 'http://localhost:8983/solr/collection1/' + req.params.queryType,
        qs: req.query
    }).pipe(res);
});

app.use('/', express.static(path.resolve(path.dirname(__filename), '..', 'client')));

module.exports = app;