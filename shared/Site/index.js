var ri = require('ractive-isomorphic');
var fs = require('fs');
var path = require('path');
var pages = require('./pages');
var partials = require('./partials');
var documentTemplate = fs.readFileSync(path.join(__dirname, 'document.html'), 'utf8');
var bodyTemplate = fs.readFileSync(path.join(__dirname, 'body.html'), 'utf8');

// disable ractive debug messages in log
ri.Ractive.DEBUG = false;

var Site = ri.Site.extend({
	pages: pages,
	partials: partials,
	documentTemplate: documentTemplate,
	bodyTemplate: bodyTemplate,
	data: {
		loading_opacity: 0,
		title: 'ractive-isomorphic-demo'
	},
	onroute: function(route, params, is_initial) {
		var self = this;
		console.log('ViewModel onroute', route, params, is_initial);
	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);
		if(self.on_client) {
			// loading animation
			self.on('ready', function(){
				self.animate('loading_opacity', 0, {easing: 'easeIn', duration: 100});
			});
			self.on('waiting', function(){
				self.animate('loading_opacity', 1, {easing: 'easeIn', duration: 100});
			});
		}
	}
});

module.exports = Site;