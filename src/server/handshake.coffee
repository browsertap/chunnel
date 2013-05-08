EventEmitter = require("events").EventEmitter
Connections  = require "./connections"
outcome      = require "outcome"

class Handshake extends EventEmitter
  
  ###
  ###

  constructor: () ->
    @connections  = new Connections()

  ###
  ###

  connect: (con) -> 
    con.once "data", (c) =>

      kp = String(c).split(":")
      cmd = kp.shift()
      args = kp

      if cmd is "connect"
        @_connect args.shift(), con
      else if cmd is "tunnel"
        cid    = kp.shift()
        secret = kp.shift()
        domain = kp.shift()
        @_addTunnel domain, cid, secret, con

  ###
  ###

  _addTunnel: (domain, cid, secret, con) ->
    @connections.addTunnel domain, cid, secret, con, (err) ->
      if err
        console.log "connot add tunnel for \"#{domain}\":#{err.message}"


  ###
  ###

  _connect: (domain, con) ->
    @connections.add domain, con, (err, c) =>
      
      if err
        return con.write "error:#{err.message}"

      con.write("success:#{c.cid}:#{c.secret}:#{domain}")

      con.once "close", () =>
        console.log "disconnect #{domain}"
        @connections.remove domain


module.exports = Handshake