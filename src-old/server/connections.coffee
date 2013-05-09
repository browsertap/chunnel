Hosts = require "./hosts"
Connection = require "./connection"

class Connections

  ###
  ###

  constructor: () ->
    @hosts            = new Hosts()
    @_connections     = {}
    @_cid = 0

  ###
  ###

  add: (domain, connection, callback) ->

    if arguments.length is 1
      callback = domain
      domain = "localhost"

    if @_connections[domain]
      return callback new Error("domain #{domain} is already taken")

    console.log "add proxy for #{domain}"

    @_connections[domain] = con = new Connection connection, String(@_cid++), String(Date.now() + Math.round(Math.random() * 9999999))

    @hosts.set domain
    callback null, con

  ###
  ###

  get: (domain, callback) ->
    if not con = @_connections[domain]
      return callback new Error("connection does not exist for \"#{domain}\"");

    callback null, @_connections[domain]

  ###
  ###

  getTunnel: (domain, callback) ->
    @get domain, (err, con) ->
      return callback(err) if err?
      con.getTunnel callback

  ###
  ###

  addTunnel: (domain, cid, secret, con, callback) ->
    @get domain, (err, c) ->
      return callback(err) if err?
      c.addTunnel cid, secret, con, callback

  ###
  ###

  remove: (domain, callback = (() ->)) ->
    delete @_connections[domain]
    @hosts.unset domain
    callback()


module.exports = Connections