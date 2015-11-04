/**
 * Created by enicky on 4/11/2015.
 */
var SerialPort = require("serialport").SerialPort;


module.exports = function mySimpleHook(sails) {

  return {
    startMySensorsProcess: function(){
      sails.log('debug','Starting the Process to poll for the serial port ... ');
      var serialPort = new SerialPort("/dev/ttyMySensorsGateway");
      serialPort.on('data', function(data){
        var d = data.toString('utf8');
        d = d.replace(/(\r\n|\n|\r)/gm,"");
        console.log('data : ', d);
      })
    },

    // Runs automatically when the hook initializes
    initialize: function (cb) {

      var hook = this;

      // You must trigger `cb` so sails can continue loading.
      // If you pass in an error, sails will fail to load, and display your error on the console.

      hook.startMySensorsProcess();

      return cb();
    }
  }
};
