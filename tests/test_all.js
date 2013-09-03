var vows = require('vows');


vows.describe('The wfs-index app')
    .addBatch(require('./test_couch'))
    .addBatch(require('./test_logging'))
    .addBatch(require('./test_wfs'))
    .addBatch(require('./test_csw'))
    .export(module);