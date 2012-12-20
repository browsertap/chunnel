var outcome = require("outcome"),
sprintf = require("sprintf").sprintf,
Client = require("./client"),
Url = require("url"),
path = require("path"),
http = require("http"),
express = require("express");

exports.require = ["confirm.native"];

exports.plugin = function(confirm, loader) {

	var clients = {},
	serverParams = loader.params("tunnel"),
	p = loader.params("http.port") + 1;

	return {
		getClient: function (referer, path, callback) {

			var on = outcome.e(callback);

			function connectClient (client) {
				client.connect(callback);
			}

			//client already exists? 
			if(clients[path]) return connectClient(clients[path]);

			//
			confirm(sprintf("%s wants to tunnel %s, allow? ", referer, path), function (yes) {
				if(!yes) return callback(new Error("Access Denied"));


				var proxy = {};

				//local file?
				if(path.substr(0, 5) == "file:") {

					//remove file:// protocol 
					var fixedPath = path.replace(/file:/,"").

					//chrome prepends localhost/ which we don't want.
					replace(/localhost\//,"");


					createFileProxy(fixedPath, proxy.port = ++p);
					proxy.hostname = "localhost";

				//not a file? tunnel it.
				} else {
					proxy = Url.parse(path);
				}


				//TODO - add hotswap script

				//tunnel the HTTP server so it can be viewd live
				connectClient(clients[path] = new Client({
					server: serverParams,
					proxy: { host: proxy.hostname, port: proxy.port || 80 }
				}));
			});

		}
	}
}


function createFileProxy (file, port) {

	//spaces will be URL encoded, so strip them
	var dir = decodeURIComponent(path.dirname(file));


	console.log("creating file server on port %d for %s", port, file);

	//dead simple
	var server = express();
	server.use(express.static(dir));
	server.listen(port);
}