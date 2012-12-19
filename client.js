var http = require("http"),
net  = require("net"),
EventEmitter = require("events").EventEmitter,
Url = require("url"),
step = require("step");

var i = 0;

var server = http.createServer(function(req, res) {
	// console.log(req.headers)
	console.log(req.url);

		// return res.end("hello world! " + (i++));
	setTimeout(function() {

		res.end("hello world! " + (i++) + req.url);
	}, 5000);
	// res.end("hello world!" + (i++));
});

server.listen(8088);



var structr = require("structr");

var Client = module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(ops) {

		this._name   = ops.name || "test";
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
		
		var self = this;

		function connect() {
			console.log("connecting %s:%d <- -> %s:%d", self._server.host, self._server.port, self._proxy.host, self._proxy.port);
			var c = net.connect(self._server),
			c2 = net.connect(self._proxy),
			reconnected = false;

			c.write(self._name || "new");
			c2.pipe(c);
			c.pipe(c2);

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





		/*step(
			function() {
				c.once("data", this);
				c.write(self._name ? "handshake:" + self._name : "handshake");
			},
			function(key) {
				self._key = String(key);
				c.on("data", function() {
					self._addProxy(key);
				});
			}
		);*/
	},

	/**
	 */

	"_addProxy": function(key) {
		console.log("G")
		var c = net.connect(this._server), self = this,
		c2 = net.connect(self._proxy);
		c.write("connection:" + key);
		c2.pipe(c);
		c.pipe(c2);
	}


});



var c = new Client({
	server: { host: "localhost", port: 8089 },
	proxy: { host: "localhost", port: 8088}
});

c.connect(function(err, resp) {
	console.log(arguments)
})

