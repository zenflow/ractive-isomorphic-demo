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
			if (stacked){
				var max = ri._.max(ri._.map(ri._.range(data[0].length), function(x){
					return ri._.sum(ri._.map(data, function(layer_data){return layer_data[x];}))
				}));
				var points = [];
				ri._.forEach(ri._.range(data.length), function(i){
					points[i] = [];
					ri._.forEach(ri._.range(data[0].length), function(x){
						var y2 = points[i-1]?points[i-1][x].y:0;
						var y1 = y2 + (data[i][x] / max);
						var x1 = x / (data[i].length-1);
						points[i][x] = {x: x1, y: y1};
						points[i][data[0].length+(data[0].length-1-x)] = {x: x1, y: y2};
					});
				});
				return ri._.map(points, function(layer_points){
					return ri._.map(layer_points, function (point) {return point.x+','+point.y;}).join(' ');
				});
			} else {
				var max = ri._.max(ri._.map(data, function(layer_data){
					return ri._.max(layer_data);
				}));
				return ri._.map(data, function(layer_data, i){
					return ri._.map(layer_data, function (datum, x) {
							return (x / (layer_data.length-1)) + ' ' + (datum / max);
						}).join(' ') + ' 1,0 0,0';
				});
			}
		}
	},
	oninit: function(){
		var self = this;
		self.set('data', self.get('data') || []);
	}
});
module.exports = Graph;