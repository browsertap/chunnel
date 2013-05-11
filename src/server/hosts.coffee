_ = require "underscore"
os = require "os"
fs = require "fs"

class Hosts

  ###
  ###

  constructor: () ->
    @_hosts = {}
    @_backup()
    @_watchExit()

  ###
  ###

  set: (domain, ip = "127.0.0.1") ->
    if not @_hosts[ip]
      @_hosts[ip] = []

    @_hosts[ip].push domain
    @_hosts[ip] = _.uniq @_hosts[ip]
    @save()

  ###
  ###

  unset: (domain) ->
    for ip of @_hosts
      i = @_hosts[ip].indexOf domain
      if ~i
        @_hosts[ip].splice(i, 1)


    @save()

  ###
  ###

  _backup: () ->
    return if fs.existsSync backupPath = @_path() + "-backup"
    fs.writeFileSync backupPath, fs.readFileSync(@_path(), "utf8")

  ###
  ###

  toString: () ->
    buffer = [""]
    for ip of @_hosts
      buffer.push ip, " ", @_hosts[ip].join(" "), "\n"

    buffer.join("")

  ###
  ###

  save: () ->
    fs.writeFileSync @_path(), @toString()

  ###
  ###

  _path: () ->
    if os.type() is "Windows_NT"
      return "C:\\Windows\\system32\\drivers\\etc\\hosts"
    else
      return "/etc/hosts"

  ###
  ###

  _watchExit: () ->
    process.once "SIGINT", () =>
    
      fs.writeFileSync @_path(), fs.readFileSync(@_path() + "-backup", "utf8")
      process.exit()


  @instance: () => @_instance or (@_instance = new Hosts())


module.exports = Hosts




