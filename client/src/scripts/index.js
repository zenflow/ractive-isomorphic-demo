var Site = require('../../../shared/Site');
var api = require('../../../shared/api');
require('./transitions');
window.vm = Site.client({api: api});