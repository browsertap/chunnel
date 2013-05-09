EventEmitter = require("events").EventEmitter

class Client

  ###
  ###

  constructor: (@connection) ->
    @_em = new EventEmitter()
    @_boundary = "||||||"

  ###
  ###

  send: (name, data, callback) ->
    @connection.write JSON.stringify({ name: name, data: data }) + @_boundary

  ###
  ###

  error: (err) -> 
    console.log "sending error: #{err?.message or err}" 
    @send "error", { message: err?.message or err }

  ###
  ###

  success: (data) -> @send "success", data


  ###
  ###

  close: () ->
    @connection.end()


  ###
  ###

  route: (methods) ->
    @routeOnce methods
    @_em.once "data", () =>
      @route methods

  ###
  ###

  routeOnce: (methods) ->

    if @_listening
      throw new Error "cannot have more than one response handler"

    @_listening = true

    @connection.once "data", (chunk) => 
      @_listening = false

      for cmd in String(chunk).split(@_boundary)
        cmd = cmd.replace(/^\s/g,"").replace(/\s$/,"")
        continue if not cmd.length
        c = JSON.parse cmd

        if typeof methods is "function"
          methods.call @, c
        else
          methods[c.name]?.call @, c.data

      @_em.emit "data", chunk





module.exports = Client