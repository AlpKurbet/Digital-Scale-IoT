function wifi_config() {

	this.wifi_handler_init = function (callback) {
		console.log();console.log('wifi Handler Starting');

		wifi_handler_child = cp.fork('./app/include/wifi_handler_child.js');
		wifi_handler_child.on('exit', function (code, signal) {
			process.exit(1);
		}).on('error', function (code, signal) {
			process.exit(1);
		}).on('disconnect', function (code, signal) {
			process.exit(1);
		}).on('message', function (msg) {			
			if(msg == 'start')
				callback();	
			else{
				network = msg;
				if(config.scale_ip != network.ipadress || config.scale_mac !=  network.macadress){
					config.scale_ip = network.ipadress;
					config.scale_mac = network.macadress;
					jsonfile.writeFileSync('./config.json', config);
					console.log("WiFi: " + network.essid);	
					console.log("IP Address: " + network.ipadress);					
				}	
			}				
			//console.log(msg)
		})
		
	}	


	this.wifi_handle_callback = function () {
	//	console.log("wifi_handle_callback");
		var msg = {
			config: config
		}
		wifi_handler_child.send(msg);
	}
}
module.exports = wifi_config;


