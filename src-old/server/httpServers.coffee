net = require "net"


class HttpServer

  ###
  ###

  constructor: (@port) ->
    @domains = []
    @_listen()


  ###
  ###

  addDomain: (domain) ->
    if !~@domains.indexOf domain
      @domains.push domain

  ###
  ###

  removeDomain: (domain) ->

    i = @domains.indexOf domain
    if ~i
      @domains.splice i, 1

    return !!@domains.length

  ###
  ###

  dispose: () ->
    @_server.close()


  ###
  ###

  _listen: () ->
    @_server = net.createServer(this._onHttpClient).listen(httpPort)


  ###
  ###

  _onHttpClient: (client) ->

    onErr = (err) ->
      con.write("Not Found: #{err?.message}")
      con.end()

    con.once "data", (h) =>
      con.pause()
      hosts = String(h).match(/host:\s+([^\r]+)/i)
      if not hosts 
        return onErr new Error "host not found"

      console.log "proxy #{hosts[1]}"

      @_connections.getTunnel "#{hosts[1]}:#{@port}", (e, c) =>
        return onErr(e) if e?
        con.pipe(c)
        c.pipe(con)
        c.write(h)
        con.resume()



class HttpServers

  ###
  ###

  constructor: () ->
    @_listening = {}

  ###
  ###

  listen: (domain, port, callback) ->
    if not @_listening[port]
      @_listening[port] = new HttpServers(port)

    @_listening[port].addDomain domain
    @_listening[port]

  ###
  ###

  unlisten: (domain, port) ->
    return if not @_listening[port]
    if @_listening[port].removeDomain(domain) is false
      @_listening[port].dispose()
      delete @_listening[port]


module.exports = HttpServers



