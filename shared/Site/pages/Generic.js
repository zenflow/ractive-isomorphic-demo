var ri = require('ractive-isomorphic');
var partials = require('../partials');
var components = require('../components');
var Page = ri.Page.extend({
	partials: partials,
	components: components,
	onroute: function(params, is_initial){
		var self = this;
		self.breadcrumbs = [{route: 'Home', text: 'home'}];
	},
	pushBreadcrumb: function(breadcrumb){
		var self = this;
		if (!self.breadcrumbs){
			throw new Error('cannot call pushBreadcrumb() after endBreadcrumbs() until next onroute()')
		}
		self.breadcrumbs.push(breadcrumb);
	},
	endBreadcrumbs: function(){
		var self = this;
		self.set('breadcrumbs', self.breadcrumbs);
		delete self.breadcrumbs;
	}
});
module.exports = Page;
