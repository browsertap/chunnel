Client = require("./client")
Server = require("./server")

net = require "net"

module.exports = 
  connect: (port, hostname) -> 
    new Client net.connect(Number(port), hostname)

  listen: (port) -> 
    new Server().listen port

  Server: Server

