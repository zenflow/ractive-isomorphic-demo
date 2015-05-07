var fs = require('fs');
var path = require('path');
var Generic = require('./Generic');
var GenericExample = require('./GenericExample');
var template = fs.readFileSync(path.join(__dirname, 'Examples.html'), 'utf8');
var Examples = Generic.extend({
	name: 'Examples',
	url: '/examples',
	template: template,
	computed: {
		examples: function(){
			var self = this;
			return self._(self.root.pages)
				.map(function(Page){
					return Page.prototype;
				})
				.filter(function(proto){
					return proto instanceof GenericExample;
				})
				.value();
		}
	},
	onroute: function(params, is_initial){
		var self = this;
		self._super.apply(self, arguments);

		// set breadcrumbs
		self.pushBreadcrumb({route: 'Examples', text: 'examples'});
		self.endBreadcrumbs();

		// set title
		self.root.set('title', 'examples' + ' @ ' + self.root.get('title'));
	}
});
module.exports = Examples;