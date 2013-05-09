EventEmitter = require("events").EventEmitter
crypto = require "crypto"

class ChunnelClient extends EventEmitter


  ###
  ###

  constructor: (@socket, @_domain) ->
    super()
    @secret = crypto.createHash('md5').update(String(Date.now() + Math.random())).digest("hex")
    @_connectionQueue = []
    @_listen()


  ###
  ###

  getConnection: (callback) ->
    @_connectionQueue.push callback
    @socket.send "getConnection"


  ###
  ###

  addConnection: (connection, secret) ->

    if secret isnt @secret
      return @socket.error new Error "cannot add connection - secret doesn't match"

    @_connectionQueue.shift()?.call @, null, connection

  ###
  ###

  _listen: () ->
    @socket.connection.once "close", () => 
      @emit "close"



module.exports = ChunnelClient
