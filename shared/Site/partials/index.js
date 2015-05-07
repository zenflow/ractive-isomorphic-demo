var path = require('path');
var fs = require('fs');
module.exports = {
	nav: fs.readFileSync(path.join(__dirname, 'nav.html'), 'utf8'),
	breadcrumbs: fs.readFileSync(path.join(__dirname, 'breadcrumbs.html'), 'utf8')
};