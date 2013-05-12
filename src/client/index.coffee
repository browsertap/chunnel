socket = require "../socket"
SocketRouter = socket.Router
Url = require "url"
net = require "net"
hooks = require "hooks"
mdns = require "mdns"
_ = require "underscore"
EventEmitter = require("events").EventEmitter

class Client extends EventEmitter

  ###
  ###

  constructor: () ->
    @_setupHooks()

  ###
  ###

  connect: (@options) ->

    if not ~options.server.indexOf("://")
      options.server = "http://#{options.server}"

    if not ~options.proxy.indexOf("://")
      options.proxy = "http://#{options.proxy}"

    @hostParts = hostParts  = Url.parse options.server
    @proxyParts = proxyParts = Url.parse options.proxy

    console.log "connecting to server #{options.server}"

    @_chunnelConnection = cc = socket.connect(hostParts.port, hostParts.hostname)
      
    cc.send "client", { 
      domain: options.domain, 
      password: options.password, 
      username: options.username 
    }

    cc.route 
      error         : @_onError
      success       : @_onConnected
      getConnection : @_onGetConnection

    cc.connection.on "end"   , @_reconnect
    cc.connection.on "error" , @_reconnect
    @
    

  ###
  ###

  _reconnect: () =>
    console.log "chunnel server has disconnected, reconnecting"

    @_cid       = undefined
    @_secret    = undefined
    @_connected = false

    setTimeout (() =>
      @connect @options
    ), 2000

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

    @emit "connected"


  ###
  ###

  _onGetConnection: () =>
    console.log "creating http connection"

    # create a net connection for the proxy
    c2 = net.connect Number(@proxyParts.port or 80), @proxyParts.hostname

    # create a socket connection for chunnel
    c = socket.connect Number(@hostParts.port), @hostParts.hostname

    # send the connection off!
    c.send "connection", { cid: @_cid, secret: @_secret }

    c2.pipe(c.connection)
    c.connection.pipe(c2)

  ###
  ###

  _setupHooks: () ->
    _.extend @, hooks
    @hook "connect", @connect
    @pre "connect", (next, options) ->
      return next() if options.server.substr(0, 1) isnt "@"

      console.log "waiting for local server %s", options.server

      browser = mdns.createBrowser(mdns.tcp("chunnel"))
      browser.on "serviceUp", (service) ->
        if service.name is options.server.substr(1)
          options.server = "#{service.addresses[0]}:#{service.port}"
          browser.stop()
          next()

      browser.start()




exports.connect = (options, callback) -> 
  client = new Client()
  client.connect(options, callback)
  client
