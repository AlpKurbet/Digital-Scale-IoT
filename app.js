function app() {

	async = require('async');
	address = require('address');
	jsonfile = require('jsonfile');
	cp = require('child_process');
	zlib = require('zlib');
	fs = require('fs');

	cp.execSync("echo none >/sys/class/leds/led1/trigger; echo 0 >/sys/class/leds/led1/brightness; sleep 1;");
	/*****************************************************/
	// GENERAL OBJECTS	

	ver = 0.0;
	id = parseInt('0x' + cp.execSync("cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2").toString()).toString();
	network = "";
	berror = "";
	wd = ""

	timers = [];
	//beacons = [];
	beacon = [];
	config = {};
	berror = ""

	seconds = 1000;
	minutes = 60 * seconds;
	hours = 60 * minutes;

	/*****************************************************/

	require('./include/wifi_handler')();
	require('./include/ota_handler')();
	require('./include/httpserver_handler')();
	require('./include/scale_handler')();


	/*****************************************************/

	// MAIN

	start = function () {

		console.log("ID " + id);

		wd = setTimeout(function () {
			fs.appendFileSync('/error.log', 'cannot fully init ' + Date().toString());
			fs.appendFileSync('/error.log', "\r\n\r\n");
			setTimeout(function () {
				cp.execSync('sudo reboot');
			}, 3 * seconds)
		}, 3 * minutes)

		setTimeout(function () {
			process.exit();
		}, 24 * hours)

		async.series([
			function (callback) { read_config(callback); },
			function (callback) { find_config(callback); },
			function (callback) { wifi_handler(callback); },
			function (callback) { ota_handler(callback); },
			function (callback) { read_config(callback); },
			function (callback) { httpserver_handler(callback); },
			function (callback) { scale_handler(callback); },
			function (callback) { loop(callback) }
		], function (err, results) {
			console.log();
			console.log("Init Completed..");
			console.log();
			clearTimeout(wd);
			wd = ""
		})
	}

	find_config = function (callback) {
		if (fs.existsSync('/boot/Config.json')) {
			console.log("Found a file with a name : /designer.json!");
			try {
				var checkjson = jsonfile.readFileSync('./config.json');
				var checkjson2 = jsonfile.readFileSync('/boot/config.json');
				for (var key in checkjson) {
					if (checkjson2[key] != undefined)
						checkjson[key] = checkjson2[key];
				}

				jsonfile.writeFileSync('./config.json', checkjson);	
				console.log("Config.json has been updated!")


			}
			catch (e) {
				console.log("No proper JSON File to overwrite")
			}

			finally {
				fs.truncate('/boot/Config.json', 0, function () { console.log('Config.json is emptied') })

			}
		}
		else {
			console.log("Couldn't find a Config.json")
		}
		callback();
	}


	read_config = function (callback) {
		if (!fs.existsSync('./config.json')) {
			var def = jsonfile.readFileSync('./config_default.json')
			jsonfile.writeFileSync('./config.json', def);
		}
		config = jsonfile.readFileSync('./config.json');

		if (config.scale_rpiid != id) {
			config.scale_rpiid = id;
			jsonfile.writeFileSync('./config.json', config);
		}
		fs.writeFileSync('/home/app/html/js/config.js', "var gateway=" + JSON.stringify(config));
		callback();
	}

	function wifi_handler(callback) {
		wifi_handler_init(callback);
	}

	function ota_handler(callback) {
		ota_handler_init(callback);
	}

	function httpserver_handler(callback) {
		httpserver_handler_init(callback);
	}

	function scale_handler(callback) {
		scale_handler_init(callback);
	}


	function loop(callback) {
		timers.push(setInterval(wifi_handle_callback, config.rate * minutes))
		timers.push(setInterval(ota_handle_callback, config.rate * hours))
		timers.push(setInterval(httpserver_handle_callback, config.rate * seconds))
		timers.push(setInterval(scale_handle_callback, config.rate * seconds))
		callback();
	}

}

module.exports = app;

