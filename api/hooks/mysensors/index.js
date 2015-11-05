/**
 * Created by enicky on 4/11/2015.
 */
var SerialPort = require("serialport").SerialPort;
var MySensorNode = require('./mysensors');

module.exports = function mySimpleHook(sails) {

  return {
    startMySensorsProcess: function(){
      sails.log('debug','Starting the Process to poll for the serial port ... ');
      var m = new MySensorNode(sails);
      m.on('sensor.reading', function(data){
        sails.log('debug','Received Sensor Reading : ', data);
      });
      m.on('device.add', function(data){
        sails.log('debug','device add ... ', data);
      });
      m.on('sensor.add', function(data){
        sails.log('debug','sensor add : ', data);
      })
      m.init({debug : true, portname : '/dev/ttyMySensorsGateway'});
      m.openConnection(function(){
        m.start();
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
