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
        var newSensorValyue = {
          internalId : data.id,
          deviceId : parseInt(data.id.substring(0, data.id.indexOf('/'))),
          sensorId : parseInt(data.id.substring(data.id.indexOf('/') + 1)),
          value : parseFloat(data.value),
          type : data.typeInt,
          deviceTypeString : data.typeString
        };
        Reading.create(newSensorValyue, function(err, saved){
          if(err) sails.log('error','Error saving sensorValue', err);
        })
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
