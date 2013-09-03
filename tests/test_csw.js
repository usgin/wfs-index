var assert = require('assert'),
    
    _ = require('underscore'),
    
    couch = require('../couch'),
    CSW = require('../csw'),
    testData = require('../testData');

module.exports = {
    'after a database purge,': {
        topic: function () {
            var callback = this.callback;
            
            couch.purgeDbs(function () {
                couch.setup(callback);    
            });
        },
        'loading a test GetRecords request': {
            topic: function () {
                couch.cacheCsw(
                    testData.cswGetRecordsResponse.url, 
                    { response: testData.cswGetRecordsResponse.response },
                     this.callback
                );
            },
            'and asking for the cached results': {
                topic: function () {
                    var csw = new CSW(testData.cswGetRecordsResponse.url);
                    csw.getRecords(1, 10, this.callback);
                },
                'does not fail': function (err, next, total, ids) {
                    assert.isNull(err);    
                },
                'returns a list of record ids': function (err, next, total, ids) {
                    if (!err) { assert(ids.length === 10); }
                },
                'returns the expected next record number': function (err, next, total, ids) {
                    assert.equal(next, 11);
                },
                'returns the expected total number of records': function (err, next, total, ids) {
                    assert.equal(total, 19054);
                }
            }
        },
        'after loading a test GetRecordById request': {
            topic: function () {
                couch.cacheCsw(
                    testData.cswGetRecordWithWfs.url,
                    { response: testData.cswGetRecordWithWfs.response },
                    this.callback
                );
            },
            'and asking for the cached results': {
                topic: function () {
                    var csw = new CSW(testData.cswGetRecordWithWfs.url);
                    csw.getRecordById('ba2f0b9d21f71acfe10609f76e17d55a', this.callback);
                },
                'does not fail': function (err, wfsUrls) {
                    assert.isNull(err);    
                },
                'returns a list of WFS URLs': function (err, wfsUrls) {
                    if (!err) { assert(wfsUrls[0] === 'http://kgs.uky.edu/arcgis/services/aasggeothermal/ALBoreholeTemperatures/MapServer/WFSServer?request=GetCapabilities&service=WFS'); }
                },
                'returns the right title': function (err, wfsUrls, title) {
                    if (!err) { assert.equal('Alabama Borehole Temperatures', title); }    
                },
                'returns the right abstract': function (err, wfsUrls, title, abstract) {
                    if (!err) {
                        assert.equal(
                            'This resource is a compilation of borehole temperatures observations compiled by the Geological Survey of Alabama, published as a Web feature service for the AASG National Geothermal Data System. The data is available in the following formats: web feature service, web map service, ESRI service and an Excel workbook for download. The workbook contains 6 worksheets, including information about the template, notes related to revisions of the template, resource provider information, the data, a field list (data mapping view) and a worksheet with vocabularies for use in populating the data worksheet (data valid terms). This data was compiled by the Geological Survey of Alabama and made available for distribution through the AASG National Geothermal Data Systems project.',
                            abstract);
                    }
                },
                'returns the right keywords': function (err, wfsUrls, title, abstract, keywords) {
                    if (!err) { assert.equal(keywords.length, 13); }    
                }
            }
        },
        'after loading a test GetRecordById request with no WFS distribution': {
            topic: function () {
                couch.cacheCsw(
                    testData.cswGetRecordNoWfs.url,
                    { response: testData.cswGetRecordNoWfs.response },
                    this.callback
                );
            },
            'and asking for the cached results': {
                topic: function () {
                    var csw = new CSW(testData.cswGetRecordNoWfs.url);
                    csw.getRecordById('50ec3aefb656b70647f32e38bc92c514', this.callback);
                },
                'does not fail': function (err, wfsUrls) {
                    assert.isNull(err);
                },
                'returns no WFS URLs': function (err, wfsUrls) {
                    if (!err) { assert.equal(wfsUrls.length, 0); }
                }
            }
        },
        'can load a remote GetRecordById request': {
            topic: function () {
                var csw = new CSW('http://catalog.stategeothermaldata.org/geoportal/csw');
                csw.getRecordById('cc54f15894222c91e71e4530dc02cd38', this.callback);
            },
            'without error': function (err, wfsUrls) {
                assert.isNull(err);    
            },
            'and find the right WFS URL': function (err, wfsUrls) {
                assert.equal('http://web2.nbmg.unr.edu/ArcGIS/services/CO_Data/COaqSpringChemistry/MapServer/WFSServer?request=GetCapabilities&service=WFS', wfsUrls[0]);    
            }
        },
        'can load a remote GetRecord request': {
            topic: function () {
                var csw = new CSW('http://catalog.stategeothermaldata.org/geoportal/csw');
                csw.getRecords(20, 20, this.callback);
            },
            'without error': function (err, next, total, ids) {
                assert.isNull(err);    
            },
            'and find the right number of IDs': function (err, next, total, ids) {
                assert.equal(ids.length, 20);    
            },
            'and return the proper next record number': function (err, next, total, ids) {
                assert.equal(next, 40);    
            }
        }
    }
};