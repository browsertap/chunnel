require("colors");

var http = require("http"),
Url = require("url"),
Client = require("./client"),
vine = require("vine"),
fs = require("fs"),
path = require("path"),
send = require("send"),
commander = require("commander"),
sprintf = require("sprintf").sprintf;




exports.listen = function(options) {

	var clients = {},
	p = options.port,
	fileServers = {};


	http.createServer(function(req, res) {

		var ops = Url.parse(req.url, true),
		referer = Url.parse(req.headers.referer || "http://unknown"),
		proxy = ops.query.proxy,
		key = proxy,
		httpFileServer;

		function onResult(data) {
			res.end(ops.query.callback + "(" + JSON.stringify(data) + ");");
		}



		if(!proxy) return onResult(vine.error("proxy must be present"));

		proxy = Url.parse(proxy);


		function connectClient(client) {
			clients[key].connect(function(err, resp) {
				onResult(vine.result(resp.address))
			})
		}


		
		if(!clients[key]) {

			commander.confirm(sprintf("%s wants to tunnel %s, allow? [y/n] ", referer.hostname, key), function(yes) {

				if(!yes) return onResult(vine.error("Access denied"));

				if(proxy.protocol == "file:") {
					httpFileServer = createFileProxy(key.replace(/file:/,"").replace(/localhost\//,""), proxy.port = ++p);
					proxy.hostname = "localhost";
				}


				var c = clients[key] = new Client({
					server: options.server,
					proxy: { host: proxy.hostname, port: proxy.port || 80 }
				});

				connectClient(c);
			});
			

		} else {
			connectClient(clients[key]);
		}

		

	}).listen(p);
}


function createFileProxy(file, port) {
	var dir = decodeURIComponent(path.dirname(file));
	console.log("creating file server on port %d for %s", port, file);
	http.createServer(function(req, res) {

		var pat = decodeURIComponent(Url.parse(req.url).pathname);

		// console.log("GET %s", path.join(dir, pat));


		send(req, pat).
		root(dir).
		on("error", function() {
			res.end("File Not Found");
		}).pipe(res);
	}).listen(port);
}
