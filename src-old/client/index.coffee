EventEmitter = require("events").EventEmitter
net = require "net"
Url = require "url"

class Client extends EventEmitter

  ###
  ###

  connect: (@options, callback) ->


    c = net.connect(Number(hostParts.port), hostParts.hostname)
    c.write "connect:#{options.domain}"

    # handshake
    c.once "data", (data) =>
      kp = String(data).split(":")
      cmd = kp.shift()

      if cmd is "error"
        console.error kp.shift()
        return process.exit()

      if cmd is "success"
        cid    = kp.shift()
        secret = kp.shift()
        domain = kp.shift()
        console.log "tunnel \"#{options.proxy}\" is now accessible via \"#{domain}\" on \"#{options.server}\""

      # pipe
      c.on "data", (data) =>
        for i in String(data).split("1")
          console.log "creating http connection"
          c2 = net.connect(Number(proxyParts.port or 80), proxyParts.hostname)
          c = net.connect(Number(hostParts.port), hostParts.hostname)
          c.write("tunnel:#{cid}:#{secret}:#{domain}")
          c2.pipe(c)
          c.pipe(c2)



exports.connect = (options, callback) -> new Client().connect(options, callback)
