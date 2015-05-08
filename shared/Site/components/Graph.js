var ri = require('ractive-isomorphic');
var fs = require('fs');
var path = require('path');
var template = fs.readFileSync(path.join(__dirname, 'Graph.html'), 'utf8');
var Graph = ri.Ractive.extend({
	isolated: true,
	template: template,
	data: {
		width: 1000,
		margin_width: 100,
		height: 500,
		margin_height: 100
	},
	oninit: function(){
		var self = this;
		self.set('data', self.get('data') || []);
		self.observe('data', function(data){
			if (data.length && (data[0].length <= 1)) {
				self.set('data', []);
				return;
			}
			ri._.forEach(data, function(layer_data){
				if (layer_data.length != data[0].length){throw new Error('must have equal number of data points for each layer!')}
			});
			var max = Math.max.apply(Math, ri._.map(data, function(layer_data){
				return Math.max.apply(Math, layer_data);
			}));
			var polygons = ri._.map(data, function(layer_data, i){
				return ri._.map(layer_data, function (datum, x) {
						return (x / (layer_data.length-1)) + ' ' + (datum / max);
					}).join(' ') + ' 1,0 0,0';
			});
			self.set('polygons', polygons);
		});
	}
});
module.exports = Graph;