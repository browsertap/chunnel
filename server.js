

var structr = require("structr"),
EventEmitter = require("events").EventEmitter,
net = require("net"),
step = require("step"),
_ = require("underscore"),
bijection = require("./bijection"),
guid = require("guid"),
http = require("http"),
inherits = require("util").inherits;

var Server = structr(EventEmitter, {

	/**
	 */

	"__construct": function() {
		this._pool = new ConnectionPool();
	},

	/**
	 */

	"listen": function(port, httpPort) {
		net.createServer(_.bind(this._onClient, this)).listen(port);
		net.createServer(_.bind(this._onHttpClient, this)).listen(httpPort || (port + 1));
		// net.createServer(_)
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

		c.pause();


		step(
			function(h) {
				self._pool.get("test", this);
			},
			function(err, con) {
				c.on("data", function(data) {
					console.log(String(data));
				})
				c.pipe(con).pipe(c);
				// con.pipe(c).pipe(con)
				c.resume();
			}

		);
		/*step(
			function() {
				c.once("data", this);
			},
			function(headers) {
				headers = String(headers);
				var Host = headers
				console.log(headers);
			}
		);*/

		
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
				var key = self._keys.get(String(k)),
				name = key.split(":").shift();


				if(!self._connections[name]) self._connections[name] = [];
				self._connections[name].push(con);
				var cb = self._next(name);
				if(cb) cb(null, con);

				console.log("add con pool name=%s n=%s", name, self._connections[name].length);

				con.on("end", _.bind(self._remove, self, name, con));
			}
		);
	},


	/**
	 */

	"_next": function(name) {
		var ret;

		if(this._queue[name]) {
			this._remove(ret = this._queue[name].shift());
		}

		return ret;
	},

	/**
	 */

	"_remove": function(name, con) {

		if(!con) return;

		if(this._queue[name]) {
			var i = this._queue[name].indexOf(con);
			if(~i) this._queue[name].splice(con);
			if(!this._queue[name].length) {
				delete this._queue[name];
			}
		}

		if(this._connections[name]) {
			var i = this._connections[name].indexOf(con);
			if(~i) this._connections[name].splice(con);
			if(!this._connections[name].length) {
				delete this._connections[name];
			}
		} 

		this._keys.remove(name);
	},

	/**
	 */

	"get": function(name, cb) {
		var self = this;

		if(this._connections[name] && this._connections[name].length) {
			return cb.call(null, null, this._connections[name].shift());
		}

		if(!this._queue[name]) this._queue[name] = [];

		this._queue[name].push(cb);
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
		if(name == "new") {
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
