var RactiveIsomorphic = require('ractive-isomorphic');
var pages = require('./pages');
var fs = require('fs');
var path = require('path');

// disable ractive debug messages in log
RactiveIsomorphic.Ractive.DEBUG = false;

var Website = RactiveIsomorphic.extend({
	pages: pages,
	documentTemplate: fs.readFileSync(path.join(__dirname, 'document.html'), 'utf8'),
	bodyTemplate: fs.readFileSync(path.join(__dirname, 'body.html'), 'utf8'),
	partials: {

	},
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

module.exports = Website;