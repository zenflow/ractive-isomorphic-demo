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
		var width = self.get('width');
		var height = self.get('height');
		if (!data.length || (data[0].length <= 1)) {
			return [];
		}
		ri._.forEach(data, function(layer_data){
			if (layer_data.length != data[0].length){throw new Error('must have equal number of data points for each layer!')}
		});
		var whole = (relative && ri._.map(data[0], function(datum, x){
				return ri._.sum(ri._.map(data, function(layer_data, i){return data[i][x];})) || 1;
			}))
			|| (stacked && ri._.max(ri._.map(data[0], function (datum, x) {
				return ri._.sum(ri._.map(data, function (layer_data) {return layer_data[x];}));
			})))
			|| ri._.max(ri._.map(data, function (layer_data) {
				return ri._.max(layer_data);
			}))
			|| 1;
		var empty = (stacked && relative && repeat(0, data[0].length))
			|| (stacked && !relative && ri._.map(data[0], function(datum, x){
				return whole - ri._.sum(ri._.map(data, function (layer_data, i) {return layer_data[x];}));
			}));
		var lines = [];
		ri._.forEach(data, function(layer_data, i){
			lines.push(ri._.map(layer_data, function(datum, x){
				var _whole = relative ? whole[x] : whole;
				var portion = height * datum / _whole;
				return {
					x: width * x / (data[i].length - 1),
					y: (stacked ? (i ? lines[i-1][x].y : -height + (height*empty[x]/_whole)) + portion : -portion)
				};
			}));
		});
		return ri._.map(lines, function(line, i){
			var line_b = !stacked && line.slice()
				|| i && lines[i-1].slice()
				|| ri._.map(line, function(p, x){return {x: p.x, y: -height + (height*empty[x]/(relative ? whole[x] : whole))}});
			return line.concat(line_b.reverse());
		});
	},
	onconfig: function(){
		var self = this;
		self.set('data', self.get('data') || []);
		self.set('polygons', self.getPolygons());
	},
	oninit: function(){
		var self = this;
		self.observe('data stacked relative width height', function(){
			// animate old polygons to new ones
			var new_polygons = self.getPolygons();
			if (self.root.on_client){
				// animate new/old polygons in from/out to horizontal line along bottom
				var trans_polygons = new_polygons;
				var old_polygons = self.get('polygons').slice();
				if (old_polygons.length != new_polygons.length){
					var width = self.get('width');
					var height = self.get('height');
					var empty_line = ri._.map(ri._.range(new_polygons[0].length / 2), function(x){
						return {x: width * x / (new_polygons[0].length / 2 - 1), y: 0};
					});
					var empty = empty_line.concat(empty_line.slice().reverse());
					var empties = repeat(empty, Math.abs(old_polygons.length - new_polygons.length));
					if (old_polygons.length < new_polygons.length){
						self.set('polygons', old_polygons.concat(empties));
					} else {
						trans_polygons = new_polygons.concat(empties);
					}
				} else {
				}
				self.animate('polygons', trans_polygons).then(function(){
					if (old_polygons.length != new_polygons.length) {
						self.set('polygons', new_polygons);
					}
				});
			} else {
				self.set('polygons', new_polygons);
			}
		}, {init: false});
	}
});

function repeat(obj, length){
	return ri._.map(ri._.range(length), function(i){return obj;});
}
module.exports = Graph;