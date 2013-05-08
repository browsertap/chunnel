Chunnel allows you to create an HTTP tunnel between any two computers. 

## CLI Example


First setup the server:

```bash
chunnel-server 80
```

Next, setup the client:

```bash
chunnel 80 localhost --server=chunnel-server-domain.com
```


