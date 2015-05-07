var fs = require('fs');
var path = require('path');
var Generic = require('./Generic');
var template = fs.readFileSync(path.join(__dirname, 'Home.html'), 'utf8');
var Home = Generic.extend({
	name: 'Home',
	url: '/',
	template: template,
	onroute: function(params, is_initial){
		var self = this;
		self._super.apply(self, arguments);

		// set breadcrumbs
		self.endBreadcrumbs();

		// set title
		self.root.set('title', 'home' + ' @ ' + self.root.get('title'));
	}
});
module.exports = Home;