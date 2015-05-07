var fs = require('fs');
var path = require('path');
var GenericExample = require('./GenericExample');
var moment = require('moment');
var template = fs.readFileSync(path.join(__dirname, 'NpmExample.html'), 'utf8');

var NpmExample = GenericExample.extend({
	name: 'NpmExample',
	url: '/examples/npm',
	example_name: 'npm',
	example_description: 'graphical view of downloads statistics for packages on npm',
	example_icon: 'github',
	example_params: {packages: 'ractive lodash express'},
	template: template,
	remove: function(package_name){
		var self = this;
		var packages = self._(self.get('packages')).pluck('package').without(package_name).value();
		self.router.pushRoute(self.name, {packages: packages.join(' ')});
	},
	onroute: function(params, is_initial){
		var self = this;
		self._super.apply(self, arguments);

		var packages = params.packages ? params.packages.split(' ') : [];

		// end breadcrumbs
		self.endBreadcrumbs();
		// set title
		var subtitle = (packages.length == 0) && ('npm example')
			|| (packages.length == 1) && ('viewing ' + packages[0])
			|| ('comparing ' + packages.join(' + '));
		self.root.set('title', subtitle + ' @ ' + self.root.get('title'));

		return Promise.all(self._.map(packages, function(package_name, i){
			return self.api.http('https://api.npmjs.org/downloads/range/last-month/'+package_name, 'GET');
		})).then(function(responses) {
			return self._(responses).filter(function(response){
				return response.statusCode == 200;
			}).map(function(response){
				return JSON.parse(response.body);
			}).filter(function(body){
				return !body.error;
			}).value();
		}).then(function(packages){
			var dates = [];
			for (var date = moment(packages[0].start); !date.isSame(packages[0].end); date.add(1, 'd')){
				dates.push(date.clone());
			}
			var labels = self._.map(dates, function(date){
				return date.format('MMMM Do');
			});
			self.set({
				packages: packages,
				graph: {
					labels: labels
				}
			});
		});

	},
	oninit: function(){
		var self = this;
		self._super.apply(self, arguments);

		self.on('prompt-keypress', function(e){
			if (e.original.keyCode == 13){
				var packages = self._.pluck(self.get('packages'), 'package');
				if (!self._.includes(packages, e.original.target.value)){
					packages.push(e.original.target.value);
					self.router.pushRoute(self.name, {packages: packages.join(' ')});
				}
				e.original.target.value='';
			}
		});
	}
});

module.exports = NpmExample;