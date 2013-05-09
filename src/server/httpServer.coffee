net = require "net"
EventEmitter = require("events").EventEmitter

class HttpServer extends EventEmitter

  ###
  ###

  constructor: () ->
    super()
    @_clients = {}


  ###
  ###

  listen: (@port) ->
    @_server = net.createServer(this._onHttpClient).listen(port)
    @_server.on("error", (err) =>
      @_server = undefined
      @close new Error "cannot open HTTP server: #{err.message}"
    )

  ###
  ###

  hasClient: (domain) -> return not @_clients[domain]

  ###
  ###

  close: (err) ->

    return if @_closed
    @_closed = true
    @_server?.close()

    for domain of @_clients
      @_clients[domain].socket.error err or new Error("http server has closed")
      @_clients[domain].socket.close()

    @_clients = {}

    @emit "close"


  ###
  ###

  addClient: (domain, client) ->
    @_clients[domain] = client

    client.once "close", () =>
      delete @_clients[domain]
      if not Object.keys(@_clients).length
        @close()


  ###
  ###

  _onHttpClient: (con) =>
    onErr = (err) ->
      console.error "http error: #{err?.message or "Unknown"}"
      con.write("Not Found: #{err?.message or "Unknown" }")
      con.end() 

    con.once "data", (h) =>
      con.pause()
      hosts = String(h).match(/host:\s+([^\r]+)/i)
      if not hosts
        return onErr new Error "host not found in HTTP headers"

      host = hosts[1].split(":").shift()


      client = @_clients[host]
      if not client
        return onErr new Error "tunnel \"#{host}\" not found"

      console.log "proxy #{host}:#{@port}"

      client.getConnection (e, c) =>
        return onErr(e) if e?
        con.pipe(c)
        c.pipe(con)

        # forward the headers
        c.write(h)
        con.resume()



module.exports = HttpServer