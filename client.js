var http = require("http"),
net  = require("net"),
EventEmitter = require("events").EventEmitter,
Url = require("url"),
step = require("step");

var i = 0;

var server = http.createServer(function(req, res) {
	console.log(req.headers)

		// res.end("hello world! " + (i++));
	setTimeout(function() {
		res.end("hello world! " + (i++));
	}, 5000);
});

server.listen(8088);



var structr = require("structr");

var Client = module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(ops) {

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
		var c = net.connect(this._server),
		self = this;

		c.on("data", function() {
			console.log("OK")
		})

		c.on("connect", function() {
			step(
				function() {
					c.once("data", this);
					c.write(self._key || "test");
				},
				function(key) {
					self._key = key;
					c.once("data", this);
				},
				function(data) {
					console.log("DAT")
					var c2 = net.connect(self._proxy);
					c2.write(data);
					c.pipe(c2).pipe(c);

					//establish a new connection
					self._connect();
				}
			);
		})

		
	}


});



var c = new Client({
	server: { host: "localhost", port: 8089 },
	proxy: { host: "localhost", port: 8088}
});

c.connect(function(err, resp) {
	console.log(arguments)
})

