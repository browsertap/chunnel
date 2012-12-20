require("./index.js").client({
	tunnel: {
		host: "browsertap.com",
		port: 9432,
		httpPort: 9433
	},
	http: {
		port: 9142
	}
});