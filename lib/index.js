var http = require("http"),
Url = require("url"),
Client = require("./client"),
vine = require("vine"),
fs = require("fs"),
path = require("path");

exports.listen = function(options) {

	var clients = {},
	p = options.port,
	fileServers = {};


	http.createServer(function(req, res) {

		var ops = Url.parse(req.url, true),
		proxy = ops.query.proxy,
		key = proxy,
		httpFileServer;

		function onResult(data) {
			res.end(ops.query.callback + "("+JSON.stringify(data)+");");
		}


		if(!proxy) return onResult(vine.error("proxy must be present"));

		proxy = Url.parse(proxy);

		
		if(!clients[key]) {

			if(proxy.protocol == "file:") {
				httpFileServer = createFileProxy(proxy.path, proxy.port = ++p);
				proxy.hostname = "localhost";
			}


			var c = clients[key] = new Client({
				server: options.server,
				proxy: { host: proxy.hostname, port: proxy.port }
			});
		}

		clients[key].connect(function(err, resp) {
			onResult(vine.result(resp.address))
		})

	}).listen(p);
}


function createFileProxy(file, port) {
	var dir = path.dirname(file);
	console.log("creating file server on port %d for %s", port, file);
	http.createServer(function(req, res) {
		var pat = Url.parse(req.url, true).pathname,
		fullPath = path.join(dir, pat);


		var rs = fs.createReadStream(fullPath);
		rs.pipe(res);
		rs.on("error", function() {
			// res.setStatus(404);
			res.end("Not Found");
		})
	}).listen(port);
}
