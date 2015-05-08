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
		getLayerPoints: function (data, width, height, max) {
			var self = this;
			return ri._.map(data, function (datum, x) {
					return (width * (x + 0.5) / data.length) + ' ' + (height * datum / max);
				}).join(' ') + ' ' + width + ',0 0,0';
		}
	},
	oninit: function(){
		var self = this;
		self.observe('graph', function(graph){
			if (graph){
				self.set(ri._.assign({}, graph, {
					max: Math.max.apply(Math, ri._.map(graph.layers, function(layer){
						return Math.max.apply(Math, layer);
					}))
				}));
			}
		});
	}
});
module.exports = Graph;