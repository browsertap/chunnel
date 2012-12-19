// var tlds = ["com", "net", "org", ""]

exports.proxy = function(host, cb) {
	var tld = host.split(".").pop();

	if(tld.length > 2 && tld.length < 5 && ) {
		return cb(null, host);
	} else {
		$.getJSON("localhost:9142?proxy=" + encodeURIComponent(host), function(data) {
			cb(null, data.result);
		});
	}
}