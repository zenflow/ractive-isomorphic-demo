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
		margin_height: 100,
		getPoints: function(polygon){
			return ri._.map(polygon, function(p){return p.x+','+ p.y;}).join(' ');
		}
	},
	getPolygons: function(){
		var self = this;
		var data = self.get('data');
		var stacked = self.get('stacked');
		var relative = self.get('relative');
		if (!data.length || (data[0].length <= 1)) {
			return [];
		}
		ri._.forEach(data, function(layer_data){
			if (layer_data.length != data[0].length){throw new Error('must have equal number of data points for each layer!')}
		});
		var max;
		if (relative) {
			max = ri._.map(data[0], function(datum, x){
				return ri._.sum(ri._.map(data, function(layer_data, i){return data[i][x];})) || 1;
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
			max = max || 1;
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
			var line_b = !stacked && line.slice()
				|| i && lines[i-1].slice()
				|| ri._.map(line, function(p, x){return {x: p.x, y: 0}});
			return [].concat(line, line_b.reverse());
		});
	},
	onconfig: function(){
		var self = this;
		self.set('data', self.get('data') || []);
		self.set('polygons', self.getPolygons());
	},
	oninit: function(){
		var self = this;
		self.observe('data stacked relative', function(){
			var polygons = self.getPolygons();
			if (self.root.on_client){
				var old_polygons = self.get('polygons');
				var actual_polygon_length = polygons.length;
				if (old_polygons.length != polygons.length){
					var empty = ri._.map(ri._.range(Math.abs(old_polygons.length - polygons.length)), function(i){
						var line = ri._.map(ri._.range(polygons[0].length / 2), function(x){
							return {x: x / (polygons[0].length / 2 - 1), y: 1};
						});
						return line.slice().concat(line.reverse());
					});
					if (old_polygons.length < polygons.length){
						self.set('polygons', old_polygons.concat(empty));
					} else {
						polygons = polygons.concat(empty);
					}
				}
				self.animate('polygons', polygons).then(function(){
					self.set('polygons', self.get('polygons').slice(0, actual_polygon_length));
				});
			} else {
				self.set('polygons', polygons);
			}
		}, {init: false});
	}
});
module.exports = Graph;