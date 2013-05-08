net       = require "net"
_         = require "underscore"
Handshake = require "./handshake"

class Server
  
  ###
  ###

  constructor: () ->
    @_handshake   = new Handshake()
    @_connections = @_handshake.connections

  ###
  ###

  listen: (httpPort, connectionPort) ->
    net.createServer(this._onClient).listen(connectionPort or (httpPort + 1))
    net.createServer(this._onHttpClient).listen(httpPort)

  ###
  ###

  _onClient: (con) =>
    @_handshake.connect con

  ###
   handles HTTP requests
  ###

  _onHttpClient: (con) =>

    onErr = (err) ->
      con.write("Not Found: #{err?.message}")
      con.end()


    con.once "data", (h) =>
      con.pause()
      hosts = String(h).match(/host:\s+([^\r]+)/i)
      if not hosts 
        return onErr new Error "host not found"

      console.log "proxy #{hosts[1]}"

      @_connections.getTunnel hosts[1], (e, c) =>
        return onErr(e) if e?
        con.pipe(c)
        c.pipe(con)
        c.write(h)
        con.resume()


exports.listen = (port) -> new Server().listen(port)