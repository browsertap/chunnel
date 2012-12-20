window.bark = {
	alert: function(message, callback) {
		if(!callback) callback = function(){};
		$alert = $("#alert-container");
		$alert.find(".alert-message").text(message);


		function cb(yes) {
			return callback(yes);
			$("#alert-container").transit({
				opacity: 0
			}, function() {
				callback(yes);
			});
		}

		$alert.transit({
			opacity: 1
		})

		$alert.find(".no").one("click", function() {
			cb(false);
		})


		$alert.find(".yes").one("click", function() {
			cb(true);
		})
	}
}