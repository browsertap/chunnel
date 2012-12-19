var http = require("http"),
Url = require("url"),
Client = require("./client"),
vine = require("vine"),
fs = require("fs"),
path = require("path"),
send = require("send");

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
				httpFileServer = createFileProxy(proxy.path.replace(/localhost\//,""), proxy.port = ++p);
				proxy.hostname = "localhost";
			}


			var c = clients[key] = new Client({
				server: options.server,
				proxy: { host: proxy.hostname, port: proxy.port || 80 }
			});
		}

		clients[key].connect(function(err, resp) {
			onResult(vine.result(resp.address))
		})

	}).listen(p);
}


function createFileProxy(file, port) {
	var dir = decodeURIComponent(path.dirname(file));
	console.log("creating file server on port %d for %s", port, file);
	http.createServer(function(req, res) {

		var pat = decodeURIComponent(Url.parse(req.url).pathname);

		console.log("GET %s", path.join(dir, pat));


		send(req, pat).
		root(dir).
		on("error", function() {
			res.end("File Not Found");
		}).pipe(res);
	}).listen(port);
}
