var express = require('express'),
    request = require('request'),
    qs = require('querystring'),
    path = require('path'),
    
    app = express(),
    
    couch = require('../couch');

app.get('/solr/:queryType', function (req, res) {
    request({
        url: 'http://localhost:8983/solr/collection1/' + req.params.queryType,
        qs: req.query
    }).pipe(res);
});

app.get('/clustered/:zoomLevel', function (req, res) {
    couch.dbs['cluster-cache'].view_with_list(
        'clusterLayer', 'byZoom', 'featureCollection', 
        { key: req.params.zoomLevel }, 
        function (err, response) {
            res.json(response);    
        }
    );
});

app.use('/', express.static(path.resolve(path.dirname(__filename), '..', 'client')));

module.exports = app;