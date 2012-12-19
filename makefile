
all:
	browserify -i ./lib/browser.js -o ./taptunnel.js
	@mkdir release; nexe -o ./release/taptunnel


clean:
	rm -rf release;
