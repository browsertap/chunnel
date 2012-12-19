var http = require("http"),
net  = require("net"),
EventEmitter = require("events").EventEmitter,
step = require("step"),
structr = require("structr");

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

			if(this.remote) {
				this.emit("remote", this.remote);
			}
		}

		this._connect();
	},

	/**
	 */

	"_connect": function() {

		if(this.connecting) return;
		this.connecting = true;
		
		var self = this, key = self._name;

		function connect() {

			console.log("connecting %s:%d <- -> %s:%d", self._proxy.host, self._proxy.port, self._server.host, self._server.port);

			var c = net.connect(self._server),
			reconnected = false;

			c.once("data", function(k) {
				key = String(k);

				var addr = key.split(":").shift(":") + "." + self._server.host + (self._server.httpPort ? ":" + self._server.httpPort : "");

				console.log("%s:%d is available via %s", self._proxy.host, self._proxy.port, addr);

				self.emit("remote", self.remote = {
					address: addr
				});


				c.on("data", function(data) {
					for(var i = String(data).split("1").length; i--;) {

						console.log("creating connection");
						var c2 = net.connect(self._proxy),
						c = net.connect(self._server);

						c.write("connection:" + key);
						c2.pipe(c);
						c.pipe(c2);

						c.on("end", function() {
							console.log("END")
						})
					}
				});
			});


			c.write("handshake:" + (key || "new"));

			
			/*function onEnd() {
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
			c2.on("end", onEnd).on("error", onError);*/

			/*c.on("end", function() {
				console.log("END")
			})*/
		}

		connect();

	}
});

