net = require("net")
EventEmitter = require("events").EventEmitter
Client = require("./client")

class Server extends EventEmitter

  ###
  ###

  listen: (port) ->
    @_server = net.createServer(this._onConnection).listen(port)


  ###
  ###

  close: () ->
    @_server.close()

  ###
  ###

  _onConnection: (con) => 
    client = new Client con
    client.routeOnce (message) => 
      @emit message.name, message.data, client



module.exports = Server