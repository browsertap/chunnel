var alpha = "abcdefghijklmnopqrstuvwxyz0123456789".split(""),
len = alpha.length;

exports.encode = function(i) {
	if(i === 0) return alpha[0];

	var s = "";

	while(i > 0) {
		s += alpha[i % len];
		i = parseInt(i / len, 10);
	}

	return s.split("").reverse().join("");
}