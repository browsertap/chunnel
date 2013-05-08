var vine = require("vine"),
outcome = require("outcome"),
Url = require("url");

exports.require = ["clients", "plugin-express"];

exports.plugin = function(tunnelClients, server, loader) {

	server.enable("jsonp callback");
	server.get("/tunnel", function(req, res) {

		//get the referer so the confirmation shows who's requesting the given file
		var referer = Url.parse(req.headers.referer || "http://unknown");

		function onError(e) {
			res.jsonp(vine.error(e));
		}


		if(!req.query.path) {
			return onError(new Error("Path must exist"));
		}

		//fetch the tunnel client for the given path
		tunnelClients.getClient(referer.hostname, req.query.path, outcome.e(onError).s(function(result) {
			res.jsonp(vine.result(result.address));
		}));
	});
}