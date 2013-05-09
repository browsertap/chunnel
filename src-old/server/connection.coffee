class Connection
  
  ###
  ###

  constructor: (@connection, @cid, @secret) ->
    this._tunnelQueue = []

  ###
  ###

  addTunnel: (cid, secret, connection, callback) ->
    if (cid isnt @cid) or (@secret isnt secret)
      return callback new Error "CID or secret is incorrect"
    return callback() if not this._tunnelQueue.length
    this._tunnelQueue.shift()(null, connection)
    callback()

  ###
  ###

  getTunnel: (callback) ->
    this._tunnelQueue.push callback
    @connection.write("1")






module.exports = Connection