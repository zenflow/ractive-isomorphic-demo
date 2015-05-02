var fs = require('fs');
var path = require('path');
var Page = require('./Page');
var template = fs.readFileSync(path.join(__dirname, 'Examples.html'), 'utf8');
var Examples = Page.extend({
	name: 'Examples',
	url: '/examples',
	template: template
});
module.exports = Examples;