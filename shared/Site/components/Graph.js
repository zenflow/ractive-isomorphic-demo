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
					return (width * x / (data.length-1)) + ' ' + (height * datum / max);
				}).join(' ') + ' ' + width + ',0 0,0';
		}
	},
	oninit: function(){
		var self = this;
		self.observe('graph', function(graph){
			if (graph){
				ri._.forEach(graph.layers, function(layer){
					if (layer.length <= 1){throw new Error('must have more than one data point!')}
				});
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