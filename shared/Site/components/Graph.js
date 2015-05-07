var ri = require('ractive-isomorphic');
var fs = require('fs');
var path = require('path');
var template = fs.readFileSync(path.join(__dirname, 'Graph.html'), 'utf8');
var Graph = ri.Ractive.extend({
	template: template,
	onconfig: function(){

	}
});
module.exports = Graph;