const path = require('path');

function pathResolve(addr) {
	return path.resolve(__dirname, addr);
}

module.exports = {
	pathResolve
};
