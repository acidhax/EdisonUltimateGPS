function UltimateGPS (serialPort) {
	this.serialPort = serialPort;
	this.serialPort.on("data", this._onData.bind(this));
}
UltimateGPS.prototype._onData = function(data) {
	var in_data = String(data);
	if( in_data.indexOf(',') === -1 ){
		console.log("error data");
		return;
	}
	var in_data_array = in_data.split('\r\n');
	for (var i = 0;i<in_data_array.length;i++){
		var item = in_data_array[i];

		if (item.indexOf('$GPRMC') !== -1){
			this._parseGPRMC(item.split(','));
		} else if (item.indexOf('$PMTKLOG')) {
			this._parsePMTKLOG(item);
		} else if (item.indexOf(UltimateGPS.Commands.PMTK_LOCUS_STARTSTOPACK)) {
			// Start/Stop data logging ACK
			console.log("ACK", item);
		}
	}
};
UltimateGPS.prototype._parsePMTKLOG = function(data_arr) {
	console.info(data_arr);
};
UltimateGPS.prototype._parseGPRMC = function(data_arr) {
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
};
UltimateGPS.prototype.sendCommand = function(command) {
	this.serialPort.write(command+"\n");
};
UltimateGPS.prototype.startLogger = function() {
	this.sendCommand(UltimateGPS.PMTK_LOCUS_STARTLOG);
};
UltimateGPS.prototype.stopLogger = function() {
	this.sendCommand(UltimateGPS.PMTK_LOCUS_STOPLOG);
};
UltimateGPS.prototype.queryLogger = function() {
	this.sendCommand(PMTK_LOCUS_QUERY_STATUS);
};
UltimateGPS.Commands = {
	PMTK_SET_NMEA_UPDATE_100_MILLIHERTZ:"$PMTK220,10000*2F", // Once every 10 seconds, 100 millihertz
	PMTK_SET_NMEA_UPDATE_200_MILLIHERTZ:"$PMTK220,5000*1B",  // Once every 5 seconds, 200 millihertz
	PMTK_SET_NMEA_UPDATE_1HZ:"$PMTK220,1000*1F",
	PMTK_SET_NMEA_UPDATE_5HZ:"$PMTK220,200*2C",
	PMTK_SET_NMEA_UPDATE_10HZ:"$PMTK220,100*2F",
	PMTK_API_SET_FIX_CTL_100_MILLIHERTZ:"$PMTK300,10000,0,0,0,0*2C", // Once every 10 seconds, 100 millihertz
	PMTK_API_SET_FIX_CTL_200_MILLIHERTZ:"$PMTK300,5000,0,0,0,0*18",  // Once every 5 seconds, 200 millihertz
	PMTK_API_SET_FIX_CTL_1HZ:"$PMTK300,1000,0,0,0,0*1C",
	PMTK_API_SET_FIX_CTL_5HZ:"$PMTK300,200,0,0,0,0*2F",
	PMTK_SET_BAUD_57600:"$PMTK251,57600*2C",
	PMTK_SET_BAUD_9600:"$PMTK251,9600*17",
	PMTK_SET_NMEA_OUTPUT_RMCONLY:"$PMTK314,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*29",
	PMTK_SET_NMEA_OUTPUT_RMCGGA:"$PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*28",
	PMTK_SET_NMEA_OUTPUT_ALLDATA:"$PMTK314,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0*28",
	PMTK_SET_NMEA_OUTPUT_OFF:"$PMTK314,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*28",
	PMTK_LOCUS_STARTLOG:"$PMTK185,0*22",
	PMTK_LOCUS_STOPLOG:"$PMTK185,1*23",
	PMTK_LOCUS_STARTSTOPACK:"$PMTK001,185,3*3C",
	PMTK_LOCUS_QUERY_STATUS:"$PMTK183*38",
	PMTK_LOCUS_ERASE_FLASH:"$PMTK184,1*22",
	LOCUS_OVERLAP:0,
	LOCUS_FULLSTOP:1,
	PMTK_ENABLE_SBAS:"$PMTK313,1*2E",
	PMTK_ENABLE_WAAS:"$PMTK301,2*2E",
	PMTK_STANDBY:"$PMTK161,0*28",
	PMTK_STANDBY_SUCCESS:"$PMTK001,161,3*36",  // Not needed currentl
	PMTK_AWAKE:"$PMTK010,002*2D",
	PMTK_Q_RELEASE:"$PMTK605*31",
	PGCMD_ANTENNA:"$PGCMD,33,1*6C",
	PGCMD_NOANTENNA:"$PGCMD,33,0*6D",
	MAXWAITSENTENCE:5
};
module.exports = UltimateGPS;

/*
// different commands to set the update rate from once a second (1 Hz) to 10 times a second (10Hz)
// Note that these only control the rate at which the position is echoed, to actually speed up the
// position fix you must also send one of the position fix rate commands below too.
#define PMTK_SET_NMEA_UPDATE_100_MILLIHERTZ  "$PMTK220,10000*2F" // Once every 10 seconds, 100 millihertz.
#define PMTK_SET_NMEA_UPDATE_200_MILLIHERTZ  "$PMTK220,5000*1B"  // Once every 5 seconds, 200 millihertz.
#define PMTK_SET_NMEA_UPDATE_1HZ  "$PMTK220,1000*1F"
#define PMTK_SET_NMEA_UPDATE_5HZ  "$PMTK220,200*2C"
#define PMTK_SET_NMEA_UPDATE_10HZ "$PMTK220,100*2F"
// Position fix update rate commands.
#define PMTK_API_SET_FIX_CTL_100_MILLIHERTZ  "$PMTK300,10000,0,0,0,0*2C" // Once every 10 seconds, 100 millihertz.
#define PMTK_API_SET_FIX_CTL_200_MILLIHERTZ  "$PMTK300,5000,0,0,0,0*18"  // Once every 5 seconds, 200 millihertz.
#define PMTK_API_SET_FIX_CTL_1HZ  "$PMTK300,1000,0,0,0,0*1C"
#define PMTK_API_SET_FIX_CTL_5HZ  "$PMTK300,200,0,0,0,0*2F"
// Can't fix position faster than 5 times a second!


#define PMTK_SET_BAUD_57600 "$PMTK251,57600*2C"
#define PMTK_SET_BAUD_9600 "$PMTK251,9600*17"

// turn on only the second sentence (GPRMC)
#define PMTK_SET_NMEA_OUTPUT_RMCONLY "$PMTK314,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*29"
// turn on GPRMC and GGA
#define PMTK_SET_NMEA_OUTPUT_RMCGGA "$PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*28"
// turn on ALL THE DATA
#define PMTK_SET_NMEA_OUTPUT_ALLDATA "$PMTK314,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0*28"
// turn off output
#define PMTK_SET_NMEA_OUTPUT_OFF "$PMTK314,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*28"

// to generate your own sentences, check out the MTK command datasheet and use a checksum calculator
// such as the awesome http://www.hhhh.org/wiml/proj/nmeaxor.html

#define PMTK_LOCUS_STARTLOG  "$PMTK185,0*22"
#define PMTK_LOCUS_STOPLOG "$PMTK185,1*23"
#define PMTK_LOCUS_STARTSTOPACK "$PMTK001,185,3*3C"
#define PMTK_LOCUS_QUERY_STATUS "$PMTK183*38"
#define PMTK_LOCUS_ERASE_FLASH "$PMTK184,1*22"
#define LOCUS_OVERLAP 0
#define LOCUS_FULLSTOP 1

#define PMTK_ENABLE_SBAS "$PMTK313,1*2E"
#define PMTK_ENABLE_WAAS "$PMTK301,2*2E"

// standby command & boot successful message
#define PMTK_STANDBY "$PMTK161,0*28"
#define PMTK_STANDBY_SUCCESS "$PMTK001,161,3*36"  // Not needed currently
#define PMTK_AWAKE "$PMTK010,002*2D"

// ask for the release and version
#define PMTK_Q_RELEASE "$PMTK605*31"

// request for updates on antenna status 
#define PGCMD_ANTENNA "$PGCMD,33,1*6C" 
#define PGCMD_NOANTENNA "$PGCMD,33,0*6D" 

// how long to wait when we're looking for a response
#define MAXWAITSENTENCE 5

*/