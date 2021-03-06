var vows = require('vows'),

    server = require('./serverControl');

vows.describe('The wfs-index app')
    .addBatch(require('./test_couch'))
    .addBatch(require('./test_logging'))
    .addBatch(require('./test_wfs'))
    .addBatch(server.start)
    .addBatch(require('./test_csw'))
    .addBatch(require('./test_main'))
    .addBatch(require('./test_indexFeatures'))
    .addBatch(server.stop)
    .addBatch(require('./test_indexer'))
    .addBatch(require('./test_clustering'))
    .export(module);
    //.run();