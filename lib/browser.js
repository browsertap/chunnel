// var tlds = ["com", "net", "org", ""]
var path = require("path");

exports.proxy = function(host, cb) {
	var tld = host.split(".").pop().split("/").shift();


	if(host.substr(0, 5) != "file:" && tld.length > 1 && tld.length < 5) {
		console.log("%s is not local, skipping taptunnel", host);
		return cb(null, host);
	} else {
		console.log("running %s through taptunnel", host);
		$.getJSON("http://localhost:9142?callback=?&proxy=" + encodeURIComponent(host), function(data) {
			console.log(host);
			console.log(path.basename(host));

			cb(null, data.result + "/" + (host.substr(0,4) == "file" ? path.basename(host) : ""));
		});
	}
}