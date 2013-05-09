net           = require "net"
ChunnelClient = require "./client"
EventEmitter  = require("events").EventEmitter
SocketServer  = require("../socket").Server
HttpServers   = require("./httpServers")

class ChunnelServer extends SocketServer

  ###
  ###

  constructor: () ->
    super()
    @_clients = []
    @_cid     = 0

    @_httpServers = new HttpServers()

    @on "client", @_onChunnelClient
    @on "connection", @_onHttpConnection

  ###
  ###

  listen: (port = 9526) ->
    super port
    console.log "chunnel server listening on port #{port}"
    @


  ###
  ###

  _onChunnelClient: (domain, socket) ->


    console.log "client connected on domain #{domain}"

    # listen in on the domain provided by the initial handshake
    if not @_httpServers.hasClient domain
      return socket.error new Error "cannot listen on domain #{domain} (might already be taken)"

    # wrap around the socket
    @_clients[String(++@_cid)] = client = new ChunnelClient socket, domain

    if not @_httpServers.listen domain, client
      return socket.error new Error "cannot setup server on #{domain} (port might be taken)"

    # listen when the connection closes
    client.once "close", () =>
      @_clients.splice(@_clients.indexOf(client), 1)

    # send a success response back to the client
    socket.send "success", { cid: @_cid, secret: client.secret }


  ###
  ###

  _onHttpConnection: (message, socket) ->
    if not client = @_clients[String(message.cid)]
      return socket.error new Error "cid does not exist"

    console.log "adding http connection for #{client._domain}"

    client.addConnection socket.connection, message.secret




exports.listen = (port) -> new ChunnelServer().listen(port)




