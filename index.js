var SerialPort = require("serialport").SerialPort;
var port = "/dev/ttyMFD1";
var serialPort = new SerialPort(port, {
  baudrate: 9600
}, false);
var gps = require('./module');
var parse_gprmc = function(data_arr){
  var gps_time = parseFloat(data_arr[1]);
  var gps_time_int = parseInt(data_arr[1]);
  var hour = Math.floor(gps_time_int / 10000);
  var minute = Math.floor((gps_time_int % 10000) / 100);
  var seconds = gps_time_int % 100;
  var miliseconds = parseInt(String(data_arr[1]).split('.')[1]);
  console.log("Time(UTC): " + hour + ":" + minute + ":" + seconds + "." + miliseconds);

  console.log("Status: " + data_arr[2]);
  var lat = data_arr[3].split('.');
  var lat_deg = parseFloat(Math.floor(lat[0] / 100));
  var lat_min = parseFloat(String(lat[0] % 100) + "." + lat[1]);
  console.log("Latitude: " + data_arr[4] + " " + String(lat_deg + (lat_min / 60)));
  var lng = data_arr[5].split('.');
  var lng_deg = parseFloat(Math.floor(lng[0] / 100));
  var lng_min = parseFloat(String(lng[0] % 100) + "." + lng[1]);
  console.log("Longitude: " + data_arr[6] + " " + String(lng_deg + (lng_min / 60)));

}

console.log("Open port: "+ port);

serialPort.open(function (error) {
  if (error) {
    console.log('Failed to open: '+error);
  } else {
    console.log('open');
    var test = new gps(serialPort);
 //    serialPort.on('data', function(data) {
 //      if (lastValue) {
	// //return;
 //      }
 //      var in_data = String(data);
 //      //console.log(in_data);
 //      if( in_data.indexOf(',') === -1 ){
 //        console.log("error data");
 //        return;
 //      }
 //      var in_data_array = in_data.split('\r\n');
 //      for (var i = 0;i<in_data_array.length;i++){
 //        if(in_data_array[i].indexOf('$GPRMC') !== -1){
 //          parse_gprmc(in_data_array[i].split(','));
 //        }
 //      }
 //    });
  }
});


var m = require('mraa'); //require mraa
console.log('MRAA Version: ' + m.getVersion()); //write the mraa version to the console

// var myDigitalPin = new m.Gpio(32); //setup digital read on pin 5
// myDigitalPin.dir(m.DIR_OUT); //set the gpio direction to output
// var isOn = true;

// function loops() {
//     console.log("TURNING GPS", isOn);
//     myDigitalPin.write(isOn?1:0); //set the digital pin to high (1)
//     //isOn=!isOn;
// }
// loops();
// setInterval(loops, 240000);


// var inPin = new m.Gpio(31);
// inPin.dir(m.DIR_IN);
// var lastValue = 0;
// function loop2() {
//     var value = inPin.read();
//     if (lastValue != value && value) {
//         lastValue = value;

//         console.info("Searching for Satellites...");
//     }
// }

// loop2();

// setInterval(loop2, 200);
