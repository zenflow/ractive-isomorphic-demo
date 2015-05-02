var ri = require('ractive-isomorphic');
var Page = ri.Page.extend({
	onroute: function(params, is_initial){
		var self = this;
		console.log(self.name, params, 'is_initial = '+is_initial);
	}
});
module.exports = Page;