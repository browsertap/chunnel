var plugin = require("plugin");


/**
 * run the client (.app)
 */

exports.client = function (options) {
	console.log("running client");
	plugin().
	params(options).
	paths(__dirname + "/node_modules").
	require("plugin-express").
	require(__dirname + "/plugins/client").
	load();
}

/**
 * server app
 */

exports.server = function (options) {
	console.log("running server");
	plugin().
	params(options).
	paths(__dirname + "/node_modules").
	require(__dirname + "/plugins/server").
	load();
}