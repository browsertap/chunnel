var http = require("http"),
net  = require("net"),
EventEmitter = require("events").EventEmitter,
step = require("step");

var i = 0;

var server = http.createServer(function(req, res) {
	// console.log(req.headers)
	console.log(req.url);



		return res.end("hello world! " + (i++));
	// res.end("hello world!" + (i++));
});

server.listen(8088);



var structr = require("structr");

var Client = module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(ops) {

		this._name   = ops.name;
		this._server = ops.server; // { host: "127.0.0.1", port: 8090 }
		this._proxy  = ops.proxy; // { host: "localhost", port: 8080 }

	},

	/**
	 */

	"connect": function(cb) {

		if(arguments.length == 1) {
			this.once("error", cb);
			this.once("remote", function(resp) {
				cb(null, resp);
			});
		}

		this._connect();
	},

	/**
	 */

	"_connect": function() {
		
		var self = this, key = self._name;

		function connect() {

			console.log("connecting %s:%d <- -> %s:%d", self._server.host, self._server.port, self._proxy.host, self._proxy.port);

			var c = net.connect(self._server),
			c2 = net.connect(self._proxy),
			reconnected = false;

			c.once("data", function(k) {
				key = String(k);
				c2.pipe(c);
				c.pipe(c2);

				self.emit("remote", {
					address: key.split(":").shift(":") + "." + self._server.host
				});
			});


			c.write(key || "new");
			
			function onEnd() {
				if(reconnected) return;
				reconnected = true;
				c2.end();
				c.end();
				connect();
			}

			function onError() {
				if(reconnected) return;
				reconnected = true;
				setTimeout(connect, 1000);
			}

			c.on("end", onEnd).on("error", onError);
			c2.on("end", onEnd).on("error", onError);
		}

		connect();

	}
});



var c = new Client({
	name: "test",
	server: { host: "localhost", port: 8089 },
	proxy: { host: "localhost", port: 8088 }
});

c.connect(function(err, resp) {
	console.log(arguments)
})

