

var structr = require("structr"),
EventEmitter = require("events").EventEmitter,
net = require("net"),
step = require("step"),
_ = require("underscore"),
bijection = require("./bijection"),
guid = require("guid"),
http = require("http"),
inherits = require("util").inherits,
outcome = require("outcome");

var Server = structr(EventEmitter, {

	/**
	 */

	"__construct": function() {
		this._pool = new ConnectionPool();
	},

	/**
	 */

	"listen": function(port, httpPort) {

		//listen for clients to proxy
		net.createServer(_.bind(this._onClient, this)).listen(port);

		//listen for incomming 
		net.createServer(_.bind(this._onHttpClient, this)).listen(httpPort || (port + 1));
	},

	/**
	 */

	"_onClient": function(c) {
		this._pool.add(c);
	},

	/**
	 */

	"_onHttpClient": function(c) {
		var self = this;


		function onErr() {
			c.write("Not Found");
			c.end();
		}

		var on = outcome.error(onErr);

		step(
			function() {
				c.once("data", this);
			},
			function(h) {
				this.headers = h;
				self._pool.get("test", this);
			},
			on.s(function(con) {
				c.pipe(con);
				con.pipe(c);
				con.write(this.headers);
				c.resume();
			})

		);
	}
});


var WaitingAgent = function(options) {
	http.Agent.call(this, options);

	this.createConnection = function() {
		return options.connection;
	}
}

inherits(WaitingAgent, http.Agent);


var ConnectionPool = structr({

	/**
	 */

	"__construct": function() {
		this._handshakes = {};
		this._connections = {};
		this._queue = {};
		this._all = [];
		this._keys = new Keys();
	},

	/**
	 */

	"add": function(con) {

		var self = this;
		step(
			function() {
				con.once("data", this);
			},
			function(k) {

				var kp = String(k).split(":"),
				cmd = kp.shift(),
				key = self._keys.get(kp.join(":"));

				//command = handshake? It's the first request. We also use this to open new connections
				//for EACH request to the local tunnel
				if(cmd == "handshake") {
					self._handshake(key, con);
				} else {
					self._add(key, con);
				}
			}
		);
	},

	/**
	 * adds a handshake
	 */

	"_handshake": function(key, con) {
		console.log("handshake %s", key);
		var name = key.split(":").shift(),
		self = this;
		this._handshakes[name] = con;
		con.write(key);

		con.on("end", function() {
			self._keys.remove(name);
			delete self._handshakes[name];
		});
	},

	/**
	 * adds a new connection
	 */

	"_add": function(key, con) {
		console.log("connection %s", key);
		var name = key.split(":").shift();
		var cb = this._next(name);
		if(cb) { 
			cb(null, con);
		} else {
			con.close();
		}
	},


	/**
	 * returns the NEXT proxiable connection
	 */

	"_next": function(name) {
		if(this._queue[name]) return this._queue[name].shift();
	},

	/**
	 * 
	 */

	"get": function(name, cb) {

		//handshake doesn't exist?
		if(!this._handshakes[name]) {
			return cb(new Error("404"));
		}

		var self = this;
		if(!this._queue[name]) this._queue[name] = [];

		this._queue[name].push(cb);

		//writing to the handshake client tells it to open a new connection
		this._handshakes[name].write("1");

	}
});

var Keys = structr({
	"__construct": function() {
		this._keys = {};
		this._i = 10000;
	},
	"get": function(key) {

		var keyParts = key.split(":"),
		name = keyParts.shift(),
		secret = keyParts.shift();

		//name does not exist? generate one
		if(!name.length) {
			name = bijection.encode(this._i++);
		}

		if(!secret) {
			secret = guid.create().value;
		}

		//name already assigned? check to see if the secret matches
		if(this._keys[name]) {

			//no? it belongs to someone else.
			if(secret != this._keys[name]) {
				return this.get(""); //incorrect key. Return new.
			}

		//otherwise assign it to the user.
		} else {
			this._keys[name] = secret;
		}

		return [name, secret].join(":");
	},
	"remove": function(name) {
		delete this._keys[name];
	}
});


new Server().listen(8089);
