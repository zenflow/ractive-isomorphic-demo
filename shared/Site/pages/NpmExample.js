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
	example_params: {packages: 'react angular ractive'},
	template: template,
	remove: function(package_name){
		var self = this;
		var packages = self._(self.get('packages')).pluck('package').without(package_name).value();
		self.router.pushRoute(self.name, {packages: packages.join(' ')});
	},
	onroute: function(params, is_initial){
		var self = this;
		self._super.apply(self, arguments);

		var package_names = params.packages ? params.packages.split(' ') : [];
		var subtitle = (package_names.length == 0) && ('npm example')
			|| (package_names.length == 1) && ('viewing ' + package_names[0])
			|| ('comparing ' + package_names.join(' + '));

		// set breadcrumbs
		self.pushBreadcrumb({route: self.name, params: params, text: package_names.length == 0 ? '...' : subtitle});
		self.endBreadcrumbs();

		// set title
		self.root.set('title', subtitle + ' @ ' + self.root.get('title'));

		return Promise.all(self._.map(package_names, function(package_name, i){
			return self.api.http('https://api.npmjs.org/downloads/range/last-month/' + package_name, 'GET')
				.then(function (response) {
					if (response.statusCode != 200) {
						throw new Error('http '+response.statusCode+' != 200');
					}
					return response;
				});
		})).then(function(responses) {
			var packages = self._(responses).map(function(response, i){
				return typeof response.body=='string' && JSON.parse(response.body);
			}).filter(function(_package, i){
				var error = _package && _package.error;
				if (error){
					self.root.displayError('error getting package \''+package_names[i]+'\': \n' + error);
				}
				return !error;
			}).value();

			if (packages.length){
				var dates = [];
				for (var date = moment(packages[0].start); !date.isSame(packages[0].end); date.add(1, 'd')){
					dates.push(date.clone());
				}
				self.set({
					packages: packages,
					graph: {
						x_labels: self._.map(dates, function(date){
							return date.format('MMMM Do');
						}),
						layers: self._.map(packages, function(_package){
							return self._.map(dates, function(date, i){
								var ref = self._.find(_package.downloads, function(d){return date.isSame(d.day);});
								return ref ? ref.downloads : 0;
							});
						}),
						colors: ['red','orange','yellow','green','blue','indigo','violet']
					}
				});
			} else {
				self.set({
					packages: [],
					graph: null
				});
			}
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