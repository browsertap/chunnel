if(process.argv.pop() == "server") {
	require("./index").server({
		tunnel: {
			port: 9432
		},
		http: {
			port: 9433
		}
	});

} else {
	require("./app");
}