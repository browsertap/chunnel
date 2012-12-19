// var tlds = ["com", "net", "org", ""]

exports.proxy = function(host, cb) {
	var tld = host.split(".").pop();


	if(tld.length > 2 && tld.length < 5) {
		console.log("%s is not local, skipping taptunnel", tld);
		return cb(null, host);
	} else {
		console.log("running %s through taptunnel", tld);
		$.getJSON("http://localhost:9142?callback=?&proxy=" + encodeURIComponent(host), function(data) {
			cb(null, data.result);
		});
	}
}