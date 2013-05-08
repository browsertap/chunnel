
class Keys

  ###
  ###

  generate: () -> crypto.createHash('md5').update(Date.now() + Math.random()).digest("hex")



module.exports = Keys