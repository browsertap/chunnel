var commander = require("commander");

exports.plugin = function() {
	return function(message, callback) {
		commander.confirm(message, callback);
	}
}