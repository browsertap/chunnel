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

			//the FIRST response will be the key that allows for more connections
			c.once("data", function(k) {
				key = String(k);

				var addr = key.split(":").shift(":") + "." + self._server.host + (self._server.httpPort ? ":" + self._server.httpPort : "");

				console.log("%s:%d is available via %s", self._proxy.host, self._proxy.port, addr);

				//emit the public address 
				self.emit("remote", self.remote = {
					address: addr
				});


				//NOW listen for anymore data. These are basically new requests
				//from the browser
				c.on("data", function(data) {

					//note that writes maybe combined into one chunk, so split apart the message
					//and create a new connection for each 1
					for(var i = String(data).split("1").length; i--;) {

						var c2 = net.connect(self._proxy),
						c = net.connect(self._server);

						//notify this is indeed a new connection
						c.write("connection:" + key);
						c2.pipe(c);
						c.pipe(c2);
					}
				});
			});

			//write the handshake for the main connection
			c.write("handshake:" + (key || "new"));

			
		}

		connect();

	}
});

