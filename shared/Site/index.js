var ri = require('ractive-isomorphic');
var fs = require('fs');
var path = require('path');
var pages = require('./pages');
var partials = require('./partials');
var components = require('./components');
var documentTemplate = fs.readFileSync(path.join(__dirname, 'document.html'), 'utf8');
var bodyTemplate = fs.readFileSync(path.join(__dirname, 'body.html'), 'utf8');

// disable ractive debug messages in log
ri.Ractive.DEBUG = false;

var Site = ri.Site.extend({
	pages: pages,
	partials: partials,
	components: components,
	documentTemplate: documentTemplate,
	bodyTemplate: bodyTemplate,
	data: {
		title: 'ractive-isomorphic-demo'
	}
});

module.exports = Site;