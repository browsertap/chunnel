var appjs = require("appjs");

exports.plugin = function() {
	appjs.serveFilesFrom(__dirname + "/content");
	var confirm = require("./confirm").plugin(appjs);

	appjs.createWindow();

	return {
		confirm: confirm.show
	}
}