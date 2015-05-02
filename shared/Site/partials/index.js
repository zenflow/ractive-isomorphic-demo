var path = require('path');
var fs = require('fs');
module.exports = {
	header: fs.readFileSync(path.join(__dirname, 'header.html'), 'utf8'),
	footer: fs.readFileSync(path.join(__dirname, 'footer.html'), 'utf8')
};