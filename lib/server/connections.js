// Generated by CoffeeScript 1.6.2
(function() {
  var Connection, Connections, Hosts;

  Hosts = require("./hosts");

  Connection = require("./connection");

  Connections = (function() {
    /*
    */
    function Connections() {
      this.hosts = new Hosts();
      this._connections = {};
      this._cid = 0;
    }

    /*
    */


    Connections.prototype.add = function(domain, connection, callback) {
      var con;

      if (arguments.length === 1) {
        callback = domain;
        domain = "localhost";
      }
      if (this._connections[domain]) {
        return callback(new Error("domain " + domain + " is already taken"));
      }
      console.log("add proxy for " + domain);
      this._connections[domain] = con = new Connection(connection, String(this._cid++), String(Date.now() + Math.round(Math.random() * 9999999)));
      this.hosts.set(domain);
      return callback(null, con);
    };

    /*
    */


    Connections.prototype.get = function(domain, callback) {
      var con;

      if (!(con = this._connections[domain])) {
        return callback(new Error("connection does not exist for \"" + domain + "\""));
      }
      return callback(null, this._connections[domain]);
    };

    /*
    */


    Connections.prototype.getTunnel = function(domain, callback) {
      return this.get(domain, function(err, con) {
        if (err != null) {
          return callback(err);
        }
        return con.getTunnel(callback);
      });
    };

    /*
    */


    Connections.prototype.addTunnel = function(domain, cid, secret, con, callback) {
      return this.get(domain, function(err, c) {
        if (err != null) {
          return callback(err);
        }
        return c.addTunnel(cid, secret, con, callback);
      });
    };

    /*
    */


    Connections.prototype.remove = function(domain, callback) {
      if (callback == null) {
        callback = (function() {});
      }
      delete this._connections[domain];
      this.hosts.unset(domain);
      return callback();
    };

    return Connections;

  })();

  module.exports = Connections;

}).call(this);