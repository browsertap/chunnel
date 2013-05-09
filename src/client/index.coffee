socket = require "../socket"
SocketRouter = socket.Router
Url = require "url"
net = require "net"

class Client

  ###
  ###

  connect: (@options) ->

    if not ~options.server.indexOf("://")
      options.server = "http://#{options.server}"

    if not ~options.proxy.indexOf("://")
      options.proxy = "http://#{options.proxy}"

    @hostParts = hostParts  = Url.parse options.server
    @proxyParts = proxyParts = Url.parse options.proxy

    @_chunnelConnection = cc = socket.connect(hostParts.port, hostParts.hostname)
      
    cc.send "client", options.domain

    cc.route 
      error         : @_onError
      success       : @_onConnected
      getConnection : @_onGetConnection
    

  ###
  ###

  _onError: (err) =>
    console.error err.message

  ###
  ###

  _onConnected: (result) =>
    return if @_connected
    @_connected = true

    # the connection index
    @_cid = result.cid

    # the secret for the connection
    @_secret = result.secret

    console.log "tunnel \"#{@options.proxy}\" is now accessible via \"#{@options.domain}\" on \"#{@options.server}\""


  ###
  ###

  _onGetConnection: () =>
    console.log "creating http connection"

    # create a net connection for the proxy
    c2 = net.connect(Number(@proxyParts.port or 80), @proxyParts.hostname)

    # create a socket connection for chunnel
    c = socket.connect(Number(@hostParts.port), @hostParts.hostname)

    # send the connection off!
    c.send "connection", { cid: @_cid, secret: @_secret }

    c2.pipe(c.connection)
    c.connection.pipe(c2)






exports.connect = (options, callback) -> new Client().connect(options, callback)
