var commander = require("commander");

exports.require = ["ui"];

exports.plugin = function(ui) {
	return ui.confirm;
}