var client = new Client();


client.connect({
  host: "someHost",     // chunnel server
  from: "localhost:80", // from host 
  to: "localhost:80"    // to host
});



var server = new Server(),
handshake  = new Handshake();


var server = new ChunnelServer(),
httpServers = new HttpServers();
server.on("client", function(client) {
  httpServers.addChunnelClient(client);
})


//http
server.clients.pre("add", function(socket, data, callback) {

});




socketRouter = new SocketRouter();

socketRouter.route(connection);
