function ota_config() {

	this.ota_handler_init = function (callback) {
		console.log();console.log('ota Handler Starting');

		ota_handler_child = cp.fork('./app/include/ota_handler_child.js');
		ota_handler_child.on('exit', function (code, signal) {
			process.exit(1);
		}).on('error', function (code, signal) {
			process.exit(1);
		}).on('disconnect', function (code, signal) {
			process.exit(1);
		}).on('message', function (msg) {			
			if(msg == 'start')
				callback();		
			//console.log(msg)
		})
		
	}	


	this.ota_handle_callback = function () {
	//	console.log("ota_handle_callback");
		var msg = {
			config: config
		}
		ota_handler_child.send(msg);
	}
}
module.exports = ota_config;


