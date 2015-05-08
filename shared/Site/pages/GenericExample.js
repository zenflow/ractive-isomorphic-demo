var Generic = require('./Generic');
var GenericExample = Generic.extend({
	onroute: function(params, is_initial) {
		var self = this;
		self._super.apply(self, arguments);
		self.pushBreadcrumb({route: 'Examples', text: 'examples'});
		self.pushBreadcrumb({route: self.name, params: self.example_params, text: self.example_name});
	}
});
module.exports = GenericExample;