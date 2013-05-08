Chunnel allows you to create an HTTP tunnel between any two computers. 

## CLI Example


First setup the server:

```bash
chunnel-server --port=80
```

Next, setup the client:

```bash
chunnel --proxy 
```


## Node.js example

Server:

```javascript
require("taptunnel").server.listen(80);
```


Client:

```javascript
require("taptunnel").client.connect({
  server : "http://10.0.1.13" , // server to tunnel to
  proxy  : "localhost:8080"   , // tunnel this to the server
  domain : "localhost"        , // set this as the domain for the TLD on the server 
})



