function httpserver_config() {

	this.httpserver_handler_init = function (callback) {
		console.log();console.log('HTTP Server Handler Starting');

		httpserver_handler_child = cp.fork('./app/include/httpserver_handler_child.js');
		httpserver_handler_child.on('exit', function (code, signal) {
			process.exit(1);
		}).on('error', function (code, signal) {
			process.exit(1);
		}).on('disconnect', function (code, signal) {
			process.exit(1);
		}).on('message', function (msg) {
			if (msg == "start")
				callback();				
			else if (msg == "read_config") {
				read_config(function () {});
			} 
			else if (msg == "system_reset"){
				cp.execSync("reboot")
			}
			else if (msg == "app_reset"){
				process.exit(0);
			}
		})
		
	}	


	this.httpserver_handle_callback = function () {
		httpserver_handler_child.send("");
	}



}
module.exports = httpserver_config;