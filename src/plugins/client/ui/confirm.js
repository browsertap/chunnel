exports.plugin = function(appjs) {
	return {
		show: function(message, callback) {
			var window = appjs.createWindow("http://appjs/alert.html", {
				width: 640,
				height: 460,
				alpha: true,
				resizable: false,
				showChrome: false,
				disableSecurity: true,
				topmost: true
			});

			

			window.on("ready", function() {
				window.frame.show().center()
				window.require = require;
				window.process = process;
				window.module = module;
				window.bark.alert(message, function(yes) {
					window.frame.hide();


					//fixes bug with chromeless window
					window.frame.showChrome = true;
					callback(yes);
					window.close();
				});
			});
		}
	}
}