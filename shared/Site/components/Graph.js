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
	computed: {
		polygons: function(){
			var self = this;
			var data = self.get('data');
			if (!data.length || (data[0].length <= 1)) {
				return [];
			}
			ri._.forEach(data, function(layer_data){
				if (layer_data.length != data[0].length){throw new Error('must have equal number of data points for each layer!')}
			});
			var stacked = self.get('stacked');
			var relative = self.get('relative');
			var max;
			if (relative) {
				max = ri._.map(data[0], function(datum, x){
					return ri._.sum(ri._.map(data, function(layer_data, i){return data[i][x]}))
				});
			} else {
				if (stacked){
					max = ri._.max(ri._.map(ri._.range(data[0].length), function (x) {
						return ri._.sum(ri._.map(data, function (layer_data) {
							return layer_data[x];
						}))
					}));
				} else {
					max = ri._.max(ri._.map(data, function (layer_data) {
						return ri._.max(layer_data);
					}));
				}
			}
			var lines = [];
			ri._.forEach(data, function(layer_data, i){
				lines.push(ri._.map(layer_data, function(datum, x){
					return {
						x: x / (data[i].length - 1),
						y: (stacked && i ? lines[i-1][x].y : 0) + (datum / (relative ? max[x] : max))
					};
				}));
			});
			return ri._.map(lines, function(line, i){
				var line_b = stacked && i ? lines[i-1].reverse() : [{x: 1, y: 0}, {x: 0, y: 0}];
				return ri._.map([].concat(line).concat(line_b), function(p){return p.x+','+ p.y;}).join(' ');
			});
		}
	},
	oninit: function(){
		var self = this;
		self.set('data', self.get('data') || []);
	}
});
module.exports = Graph;