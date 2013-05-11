Url        = require "url"
HttpServer = require "./httpServer"
Hosts      = require("./hosts")


class HttpServers

  ###
  ###

  constructor: () ->
    @_servers = {}
    @_hosts = Hosts.instance()
    @_domainCount = {}


  ###
  ###

  hasClient: (domain) ->
    dp = @_parseDomain domain
    return not @_servers[dp.port] or @_servers[dp.port].hasClient dp.hostname


  ###
  ###

  listen: (domain, client) ->


    domainParts = @_parseDomain domain
    hn = domainParts.hostname
    port = domainParts.port

    if not @_domainCount[hn]
      @_domainCount[hn] = 1
      @_hosts.set hn


    if not server = @_servers[port]
      @_servers[port] = server = new HttpServer()
      if not server.listen port
        return false

    server.addClient hn, client

    server.once "close", () =>
      @_domainCount[hn]--
      if not @_domainCount[hn]
        @_hosts.unset hn

      console.log "http server on port #{port} has closed"

      delete @_servers[port]

      console.log "#{Object.keys(@_servers).length} http servers running"




  ###
  ###

  _parseDomain: (domain = "") ->
    if not ~domain.indexOf("://")
      domain = "http://#{domain}" 

    dp = Url.parse domain

    if not dp.port
      dp.port = 80

    dp

module.exports = HttpServers

