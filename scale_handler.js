function scale_config() {

	this.scale_handler_init = function (callback) {
		console.log();console.log('Scale Handler Starting');

		scale_handler_child = cp.fork('./app/include/scale_handler_child.js');
		scale_handler_child.on('exit', function (code, signal) {
			process.exit(1);
		}).on('error', function (code, signal) {
			process.exit(1);
		}).on('disconnect', function (code, signal) {
			process.exit(1);
		}).on('message', function (msg) {
			if (msg == "start")
				callback();			

		})
		
	}	


	this.scale_handle_callback = function () {
		var msg = {
			network: network,
			config: config,
			berror: berror
		}
		scale_handler_child.send(msg);
	}



}
module.exports = scale_config;