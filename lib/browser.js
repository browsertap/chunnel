// var tlds = ["com", "net", "org", ""]
var path = require("path");

exports.proxy = function(host, cb) {
	// var tld = host.split(".").pop().split("/").shift().split(":").shift();

	host = host.replace(/:\//,"://");
	// console.log(host)
	
	console.log(getLocation(host).hostname, getLocation(host).host)
	var hi = getLocation(host),
	tld = hi.hostname.indexOf("localhost") == -1 ? hi.hostname.split(".").pop() : "";
	// console.log(hi)

	// console.log(tld)
	console.log(host.split(".").pop().split("/").shift())


	if(host.substr(0, 5) != "file:" && tld.length > 1 && tld.length < 5) {
		console.log("%s is not local, skipping taptunnel", host);
		return cb(null, host);
	} else {
		console.log("running %s through taptunnel", host);
		$.getJSON("http://localhost:9142?callback=?&proxy=" + encodeURIComponent(host), function(data) {
			var newHost = data.result;

			if(host.substr(0, 4) == "file") {
				newHost += "/" + path.basename(host);
			} else {
				newHost += hi.pathname;
			}

			console.log(hi.pathname);
			console.log(newHost)

			cb(null, newHost);
		});
	}
}

var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};