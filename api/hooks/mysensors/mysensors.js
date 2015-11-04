/**
 * Created by enicky on 4/11/2015.
 */
/**
 * Created by NicholasE on 2/06/2014.
 */
var SerialPort = require("serialport").SerialPort;
var serialport = require("serialport");
var sugar = require('sugar');
var mySensorEnums = require('./enums');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _currentDevices = new Object();
var fs = require('fs');
var path = require('path');


var MySensorNode = function(sails) {

  this.sails = sails;
  var enums = new mySensorEnums();
  var _debug = false;
  var _portname = '/dev/ttyMySensorsGateway';
  var _serialPort = null;
  var commandsMap = {};
  var _units = "M";
  var _gatewayVersion = '';

  this.getMessageTypeName = function(type) {
    switch (parseInt(type)) {
      case enums.SensorCommand.C_INTERNAL.value:
        return "C_INTERNAL";
        break;
      case enums.SensorCommand.C_PRESENTATION.value:
        return "C_PRESENTATION";
        break;
      case enums.SensorCommand.C_REQ.value:
        return "C_REQ";
        break;
      case enums.SensorCommand.C_SET.value:
        return "C_SET";
        break;
      case enums.SensorCommand.C_STREAM.value:
        return "C_STREAM";
        break;
    }
  }

  this.getDeviceTypeName = function(type) {
    switch (parseInt(type)) {
      case enums.SensorSensor.S_DOOR.value:
        return "S_DOOR";
      case enums.SensorSensor.S_MOTION.value:
        return "S_MOTION";
      //TODO: verder afwerken zie ook SensorSensor
      case enums.SensorSensor.S_SMOKE.value:
        return "S_SMOKE";
      case enums.SensorSensor.S_LIGHT.value:
        return "S_LIGHT";
      case enums.SensorSensor.S_DIMMER.value:
        return "S_DIMMER";
      case enums.SensorSensor.S_COVER.value:
        return "S_COVER";
      case enums.SensorSensor.S_TEMP.value:
        return "S_TEMP";
      case enums.SensorSensor.S_HUM.value:
        return "S_HUM";
      case enums.SensorSensor.S_BARO.value:
        return "S_BARO";
      case enums.SensorSensor.S_WIND.value:
        return "S_WIND";
      case enums.SensorSensor.S_RAIN.value:
        return "S_RAIN";
      case enums.SensorSensor.S_UV.value:
        return "S_UV";
      case enums.SensorSensor.S_WEIGHT.value:
        return "S_WEIGHT";
      case enums.SensorSensor.S_POWER.value:
        return "S_POWER";
      case enums.SensorSensor.S_HEATER.value:
        return "S_HEATER";
      case enums.SensorSensor.S_DISTANCE.value:
        return "S_DISTANCE";
      case enums.SensorSensor.S_LIGHT_LEVEL.value:
        return "S_LIGHT_LEVEL";
      case enums.SensorSensor.S_ARDUINO_NODE.value:
        return "S_ARDUINO_NODE";
      case enums.SensorSensor.S_ARDUINO_REPEATER_NODE.value:
        return "S_ARDUINO_REPEATER_NODE";
      case enums.SensorSensor.S_LOCK.value:
        return "S_LOCK";
      case enums.SensorSensor.S_IR.value:
        return "S_IR";
      case enums.SensorSensor.S_AIR_QUALITY.value:
        return "S_AIR_QUALITY";
      case enums.SensorSensor.S_CUSTOM.value:
        return "S_CUSTOM";
      case enums.SensorSensor.S_DUST.value:
        return "S_DUST";
      case enums.SensorSensor.S_SCENE_CONTROLLER.value:
        return "S_SCENE_CONTROLLER";
    }
  }

  this.getStreamVariableTypeName = function(type) {
    switch (parseInt(type)) {
      case enums.SensorStream.ST_FIRMWARE_CONFIG_REQUEST.value:
        return "ST_FIRMWARE_CONFIG_REQUEST";
      case enums.SensorStream.ST_FIRMWARE_CONFIG_RESPONSE.value:
        return "ST_FIRMWARE_CONFIG_RESPONSE";
      case enums.SensorStream.ST_FIRMWARE_REQUEST.value:
        return "ST_FIRMWARE_REQUEST";
      case enums.SensorStream.ST_FIRMWARE_RESPONSE.value:
        return "ST_FIRMWARE_RESPONSE";
      case enums.SensorStream.ST_SOUND.value:
        return "ST_SOUND";
      case enums.SensorStream.ST_IMAGE.value:
        return "ST_IMAGE";
    }
  }

  this.getVariableTypeName = function(type) {
    //console.log('current variableTypeName : ' + type);
    switch (parseInt(type)) {
      case enums.SensorData.V_TEMP.value:
        return "V_TEMP";
      case enums.SensorData.V_HUM.value:
        return "V_HUM";
      case enums.SensorData.V_LIGHT.value:
        return "V_LIGHT";
      case enums.SensorData.V_DIMMER.value:
        return "V_DIMMER";
      case enums.SensorData.V_PRESSURE.value:
        return "V_PRESSURE";
      case enums.SensorData.V_FORECAST.value:
        return "V_FORECAST";
      case enums.SensorData.V_RAIN.value:
        return "V_RAIN";
      case enums.SensorData.V_RAINRATE.value:
        return "V_RAINRATE";
      case enums.SensorData.V_WIND.value:
        return "V_WIND";
      case enums.SensorData.V_GUST.value:
        return "V_GUST";
      case enums.SensorData.V_DIRECTION.value:
        return "V_DIRECTION";
      case enums.SensorData.V_UV.value:
        return "V_UV";
      case enums.SensorData.V_WEIGHT.value:
        return "V_WEIGHT";
      case enums.SensorData.V_DISTANCE.value:
        return "V_DISTANCE";
      case enums.SensorData.V_IMPEDANCE.value:
        return "V_IMPEDANCE";
      case enums.SensorData.V_ARMED.value:
        return "V_ARMED";
      case enums.SensorData.V_TRIPPED.value:
        return "V_TRIPPED";
      case enums.SensorData.V_WATT.value:
        return "V_WATT";
      case enums.SensorData.V_KWH.value:
        return "V_KWH";
      case enums.SensorData.V_SCENE_ON.value:
        return "V_SCENE_ON";
      case enums.SensorData.V_SCENE_OFF.value:
        return "V_SCENE_OFF";
      case enums.SensorData.V_HEATER.value:
        return "V_HEATER";
      case enums.SensorData.V_HEATER_SW.value:
        return "V_HEATER_SW";
      case enums.SensorData.V_LIGHT_LEVEL.value:
        return "V_LIGHT_LEVEL";
      case enums.SensorData.V_VAR1.value:
        return "V_VAR1";
      case enums.SensorData.V_VAR2.value:
        return "V_VAR2";
      case enums.SensorData.V_VAR3.value:
        return "V_VAR3";
      case enums.SensorData.V_VAR4.value:
        return "V_VAR4";
      case enums.SensorData.V_VAR5.value:
        return "V_VAR5";
      case enums.SensorData.V_UP.value:
        return "V_UP";
      case enums.SensorData.V_DOWN.value:
        return "V_DOWN";
      case enums.SensorData.V_STOP.value:
        return "V_STOP";
      case enums.SensorData.V_IR_SEND.value:
        return "V_IR_SEND";
      case enums.SensorData.V_IR_RECEIVE.value:
        return "V_IR_RECEIVE";
      case enums.SensorData.V_FLOW.value:
        return "V_FLOW";
      case enums.SensorData.V_VOLUME.value:
        return "V_VOLUME";
      case enums.SensorData.V_LOCK_STATUS.value:
        return "V_LOCK_STATUS";
      case enums.SensorData.V_DUST_LEVEL.value:
        return "V_DUST_LEVEL";
      case enums.SensorData.V_VOLTAGE.value:
        return "V_VOLTAGE";
      case enums.SensorData.V_CURRENT.value:
        return "V_CURRENT";
    }
  }

  this.getInternalTypeName = function(type) {
    switch (parseInt(type)) {
      case enums.SensorInternal.I_BATTERY_LEVEL.value:
        return "I_BATTERY_LEVEL";
      case enums.SensorInternal.I_TIME.value:
        return "I_TIME";
      case enums.SensorInternal.I_VERSION.value:
        return "I_VERSION";
      case enums.SensorInternal.I_ID_REQUEST.value:
        return "I_ID_REQUEST";
      case enums.SensorInternal.I_ID_RESPONSE.value:
        return "I_ID_RESPONSE";
      case enums.SensorInternal.I_INCLUSION_MODE.value:
        return "I_INCLUSION_MODE";
      case enums.SensorInternal.I_CONFIG.value:
        return "I_CONFIG";
      case enums.SensorInternal.I_FIND_PARENT.value:
        return "I_FIND_PARENT";
      case enums.SensorInternal.I_FIND_PARENT_RESPONSE.value:
        return "I_FIND_PARENT_RESPONSE";
      case enums.SensorInternal.I_LOG_MESSAGE.value:
        return "I_LOG_MESSAGE";
      case enums.SensorInternal.I_CHILDREN.value:
        return "I_CHILDREN";
      case enums.SensorInternal.I_SKETCH_NAME.value:
        return "I_SKETCH_NAME";
      case enums.SensorInternal.I_SKETCH_VERSION.value:
        return "I_SKETCH_VERSION";
      case enums.SensorInternal.I_REBOOT.value:
        return "I_REBOOT";
      case enums.SensorInternal.I_GATEWAY_READY.value:
        return "I_GATEWAY_READY";
    }
  }
  //return beautifum string ;o)
  this.prettify = function(message, that) {
    //console.log('message : ', message);

    var radioId;
    var childId;
    var messageType;
    var subType;
    var result = '';

    var items = message.split(';');
    if (items.length < 4 || items.length > 6) {
      return console.error('ERROR : string is not correct !!! "' + message + '"');

    } else {
      var payload;
      if (items.length == 6) payload = items[5];
      result = "" + items[0] + '/' + items[1] + ";" + that.getMessageTypeName(items[2]) + ';';

      switch (that.getMessageTypeName(items[2])) {
        case enums.SensorCommand.C_PRESENTATION.toString():
          result += that.getDeviceTypeName(items[4]);
          break;
        case enums.SensorCommand.C_SET.toString():
          result += that.getVariableTypeName(items[4]);
          break;
        case enums.SensorCommand.C_REQ.toString():
          result += that.getVariableTypeName(items[4]);
          break;
        case enums.SensorCommand.C_STREAM.toString():
          result += that.getStreamVariableTypeName(items[4]);
          break;
        case enums.SensorCommand.C_INTERNAL.toString():
          result += that.getInternalTypeName(items[4]);
          break;
      }
      result += ';' + payload;
    }
    return result;
  }

  //handle messages received ...
  this.handleMessage = function(message, that) {

    if (that._debug) {
      //console.log('message :', message);
      var prettyString = that.prettify(message, that);
      var now = Date.create().format('{d}/{M}/{yyyy} {HH}:{mm}:{ss}');
      console.log('[' + now + '] : ' + prettyString);
    }
    var splittedMessage = message.split(';');
    if (splittedMessage.length > 3 && splittedMessage.length < 7) {
      var radioId = parseInt(splittedMessage[0]);
      var childId = parseInt(splittedMessage[1]);
      var internalid = radioId + '/' + childId;
      var messageType = parseInt(splittedMessage[2]);
      var isAckMessage = parseInt(splittedMessage[3]) == 0 ? false : true;
      var subType = parseInt(splittedMessage[4]);
      var payload = null;
      var valid = false;

      //console.log('internalid', internalid);


      that.getDeviceInfo(radioId, childId, function(err, deviceInfo) {
        sails.log('debug','DeviceInfo found : ', deviceInfo);
        if (deviceInfo == null && (parseInt(messageType) != enums.SensorCommand.C_INTERNAL.value && parseInt(messageType) != enums.SensorCommand.C_PRESENTATION.value)) return;
        if (splittedMessage.length == 6) payload = splittedMessage[5];
        switch (parseInt(messageType)) {
          case enums.SensorCommand.C_INTERNAL.value:
            switch (subType) {
              case enums.SensorInternal.I_BATTERY_LEVEL.value:
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload,
                  type: 'battery'
                });
                break;
              case enums.SensorInternal.I_TIME.value:
                var timestamp = Date.now();
                that.sendMessage(internalid, enums.SensorCommand.C_INTERNAL.value, enums.SensorInternal.I_TIME.value, timestamp.toString());
                break;
              case enums.SensorInternal.I_ID_REQUEST.value:
                var Incrementor = mongoose.model('Incrementor');
                var n = new Incrementor({
                  name: internalid
                });
                n.save(function(err, newIncrementor) {
                  console.log('NewIncerementor : ', newIncrementor);
                  var newInt = newIncrementor._id;
                  that.sendMessage(internalid, enums.SensorCommand.C_INTERNAL.value, enums.SensorInternal.I_ID_RESPONSE.value, newInt.toString());
                })
                break;
              case enums.SensorInternal.I_ID_RESPONSE.value:
                console.log('id response from sensor : ', payload);
                break;
              case enums.SensorInternal.I_INCLUSION_MODE.value:
                console.log('Enter Inclusion Mode ... ');
                break;
              case enums.SensorInternal.I_CONFIG.value:
                console.log('Config : ', payload);
                break;
              case enums.SensorInternal.I_FIND_PARENT.value:
                console.log('Find Parent ... ', paylad);
                break;
              case enums.SensorInternal.I_FIND_PARENT_RESPONSE.value:
                console.log('Find Parent Response', payload);
                break;
              case enums.SensorInternal.I_LOG_MESSAGE.value:
                if (payload == 'Arduino startup complete.') {
                  that.emit('startup.complete');
                }
                break;
              case enums.SensorInternal.I_CHILDREN.value:
                console.log('I_CHILDREN / ', payload);
                break;
              case enums.SensorInternal.I_SKETCH_NAME.value:
                that.emit('internal.sketch.name', payload);
                break;
              case enums.SensorInternal.I_SKETCH_VERSION.value:
                that.emit('internal.sketch.version', payload);
                break;
              case enums.SensorInternal.I_REBOOT.value:
                console.log('I_REBOOT', payload);
                break;
              case enums.SensorInternal.I_GATEWAY_READY.value:
                that.emit('internal.gateway.ready', payload);
                break;

            }
            break;
          case enums.SensorCommand.C_PRESENTATION.value:
            switch (subType) {
              case enums.SensorSensor.S_DOOR.value:
              case enums.SensorSensor.S_MOTION.value:
                that.newDevice(internalid, 'binarysensor', that);
                break;
              case enums.SensorSensor.S_SMOKE.value:
                that.newDevice(internalid, "smokedetector", that);
                break;
              case enums.SensorSensor.S_LIGHT.value:
              case enums.SensorSensor.S_HEATER.value:
                that.newDevice(internalid, "switch", that);
                break;
              case enums.SensorSensor.S_DIMMER.value:
                that.newDevice(internalid, "dimmer", that);
                break;
              case enums.SensorSensor.S_COVER.value:
                that.newDevice(internalid, "drapes", that);
                break;
              case enums.SensorSensor.S_TEMP.value:
                that.newDevice(internalid, "temperaturesensor", that);
                break;
              case enums.SensorSensor.S_HUM.value:
                that.newDevice(internalid, "humiditysensor", that);
                break;
              case enums.SensorSensor.S_BARO.value:
                that.newDevice(internalid, "barometricsensor", that);
                break;
              case enums.SensorSensor.S_WIND.value:
                that.newDevice(internalid, "windsensor", that);
                break;
              case enums.SensorSensor.S_RAIN.value:
                that.newDevice(internalid, "rainsensor", that);
                break;
              case enums.SensorSensor.S_UV.value:
                that.newDevice(internalid, "uvsensor", that);
                break;
              case enums.SensorSensor.S_WEIGHT.value:
                that.newDevice(internalid, "weightsensor", that);
                break;
              case enums.SensorSensor.S_POWER.value:
                that.newDevice(internalid, "powermeter", that);
                break;
              case enums.SensorSensor.S_DISTANCE.value:
                that.newDevice(internalid, "distancesensor", that);
                break;
              case enums.SensorSensor.S_LIGHT_LEVEL.value:
                that.newDevice(internalid, "brightnesssensor", that);
                break;
              case enums.SensorSensor.S_LOCK.value:
                that.newDevice(internalid, "lock", that);
                break;
              case enums.SensorSensor.S_IR.value:
                that.newDevice(internalid, "infraredblaster", that);
                break;
              case enums.SensorSensor.S_WATER.value:
                that.newDevice(internalid, "watermeter", that);
                break;
              case enums.SensorSensor.S_AIR_QUALITY.value:
                that.newDevice(internalid, "airquality", that);
                break;
              case enums.SensorSensor.S_CUSTOM.value:
                that.newDevice(internalid, "custom", that);
                break;
              case enums.SensorSensor.S_DUST.value:
                that.newDevice(internalid, "dust", that);
                break;
              case enums.SensorSensor.S_SCENE_CONTROLLER.value:
                that.newDevice(internalid, "scenecontroller", that);
                break;
            }
            break;
          case enums.SensorCommand.C_REQ.value:
            if (deviceInfo != null) {
              if (deviceInfo.counter_sent == null) deviceInfo.counter_sent = 1;
              else deviceInfo.counter_sent = parseFloat(deviceInfo.counter_sent) + 1;

              that.saveDeviceInfo(deviceInfo, internalid, function(err, result) {
                if (err) console.error('error saving deviceInfo (REQUEST_VARIABLE) : ' + err);
                that.sendMessage(internalid, enums.SensorCommand.C_SET.value, subType, deviceInfo.value);
              });
            } else {
              //no device found ... cannot save data
              console.error('Device not found ... cannot send variable');
            }
            break;
          case enums.SensorCommand.C_SET.value:
            if (deviceInfo != null) {
              if (deviceInfo.counter_received == null) deviceInfo.counter_received = 1;
              else deviceInfo.counter_received = parseFloat(deviceInfo.counter_received) + 1;
              that.saveDeviceInfo(deviceInfo, internalid, function(err, result) {
                if (err) console.error('error saving deviceInfo (SET_VARIABLE) : ' + err);
              });
            }
            switch (subType) {
              case enums.SensorData.V_HUM.value:
                valid = true;
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload,
                  type: "humidity"
                });
                break;
              case enums.SensorData.V_TEMP.value:
                valid = true;
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload,
                  type: 'temperature'
                });
                break;
              case enums.SensorData.V_TRIPPED.value:
                valid = true;
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload == 1 ? true : false,
                  type: 'tripped'
                });
                break;
              case enums.SensorData.V_LIGHT.value:
                valid = true;
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload == 1 ? true : false,
                  type: 'statechanged'
                });
                break;
              case enums.SensorData.V_DIMMER.value:
                valid = true;
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload,
                  type: 'dimmer'
                });
                break;
              case enums.SensorData.V_PRESSURE.value:
                valid = true;
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload,
                  type: 'pressure'
                });
                break;
              case enums.SensorData.V_DISTANCE.value:
                valid = true;
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload,
                  type: 'distance'
                });
                break;
              case enums.SensorData.V_LIGHT_LEVEL.value:
                valid = true;
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload,
                  type: 'lux'
                });
                break;
              case enums.SensorData.V_VAR1.value:
                valid = true;
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload,
                  type: 'var1'
                });
                break;
              case enums.SensorData.V_RAIN.value:
                valid = true;
                that.emit('sensor.reading', {
                  id: internalid,
                  value: payload,
                  type: 'rain'
                });
                break;
            }
            if (valid) {
              deviceInfo.value = payload;
              that.saveDeviceInfo(deviceInfo, internalid, function(err, res) {
                if (err) console.error('error saving deviceInfo (SET_VARIABLE) : ' + err);
              });
            } else {
              console.warn('requested device with subtype "' + subType + '" is not supported yet ... ');
            }

            //that.sendMessage(internalid, enums.Se.VARIABLE_ACK, subType, payload);

            break;
          /* case enums.SensorMessageType.VARIABLE_ACK.value :
           console.log('variable ack ... ');
           break;
           */
        }
      });


    }


  }

  this.sendCompleteMessage = function(message) {
    var targetMessage = message + '\n';
    this._serialPort.write(targetMessage);
  }
  //write message to serial port
  this.sendMessage = function(internalid, type, subtype, value) {
    var items = internalid.split('/');
    var that = this;
    var ack = "0";
    var infos = this.getDeviceInfo(internalid[0], internalid[1], function(err, result) {
      var radioId = items[0];
      var childId = items[1];
      var command = radioId + ';' + childId + ';' + type + ';' + ack + ';' + subtype + ';' + value + ';\n';
      console.log('sendmessage : ', command);
      if (infos && infos.type == 'switch' && type == mySensorEnums.SensorMessageType.SET_VARIABLE) {
        var cmd = {
          command: command,
          attempts: 0
        };
        that.commandsMap[internalid] = cmd;
      }
      that._serialPort.write(command);
    });

    //that._serialPort.write('0;0;4;4;\n');
  }
}
util.inherits(MySensorNode, EventEmitter);


MySensorNode.prototype.init = function(options) {
  var that = this;
  this._debug = options && options.debug ? true : false;
  this._portname = options && options.portname ? options.portname : '/dev/ttyMySensorsGateway';
  this._serialPort = new SerialPort(this._portname);
};

//open the connection and connect the listener ...
MySensorNode.prototype.openConnection = function(cb) {
  var that = this;
  this._serialPort.on("open", function() {

    that._serialPort.on('data', function(data) {
      message = data.toString('utf8').replace(/(\r\n|\n|\r)/gm,"");
      that.handleMessage(message, that);
    });
    return cb();
  });
}

MySensorNode.prototype.start = function() {
  var that = this;

  var getVersionRequest = '0;0;3;0;2;';
  this.sendCompleteMessage(getVersionRequest);
}

MySensorNode.prototype.newDevice = function(internalid, devicetype, that) {
  var deviceId = internalid.substring(0, internalid.indexOf('/'));
  var childId = internalid.substr(internalid.indexOf('/') + 1);
  //console.log('Got Device Presentation ... ');
  that.getDeviceInfo(deviceId, childId, function(err, device) {
    if (device != null) {
      if (device.type != devicetype) {
        console.log('Reconditioned sensor detected (oldType="' + device.type + '" newType="' + devicetype + '")');
        that.emit('sensor.remove', internalid);
        that.addDevice(internalid, devicetype, that);
      } else {
        that.addDevice(internalid, devicetype, that);
      }
    } else {
      that.addDevice(internalid, devicetype, that);
    }
  })
}

MySensorNode.prototype.addDevice = function(internalid, devicetype, that) {
  var newSensor = {
    type: devicetype,
    value: "0",
    counter_sent: "0",
    counter_received: "0",
    counter_retries: "0",
    counter_failed: "0"
  };

  _currentDevices[internalid] = newSensor;
  var splittedId = internalid.split('/');
  var deviceTypeString = that.getDeviceTypeName(devicetype);

  var Sensor = mongoose.model('SensorNode');
  console.log('addDevice : ' + internalid + ' -- ' + devicetype);
  Sensor.findOne({
    internalid: internalid.replace('/', ',')
  }).exec(function(err, sensor) {
    if (typeof(sensor) != "undefined" && sensor != null) {
      //update
      sensor.type = devicetype;
      sensor.deviceTypeString = deviceTypeString;
      sensor.save(function(err, sensor) {
        //console.log('Updated Device ... ', sensor);
      })
    } else {
      var newSensor = new Sensor({
        deviceid: splittedId[0].toString(),
        sensorid: splittedId[1].toString(),
        internalid: splittedId,
        type: devicetype,
        deviceTypeString: deviceTypeString
      });

      newSensor.save(function(err, savedSensor) {
        if (err) console.error('error adding device  ... ' + err);
        that.emit('device.add', {
          deviceid: splittedId[0].toString()
        });
        that.emit('sensor.add', {
          deviceid: splittedId[0].toString(),
          childid: splittedId[1].toString(),
          type: devicetype,
          deviceTypeString: deviceTypeString
        })
      });
    }
  })


}

MySensorNode.prototype.saveDeviceInfo = function(deviceInfo, internalid, cb) {
  var that = this;
  var Sensor = mongoose.model('SensorNode');


  Sensor.findOneAndUpdate({
    internalid: internalid.replace('/', ',')
  }, {
    $set: {
      type: deviceInfo.type,
      counter_failed: deviceInfo.counter_failed,
      counter_retries: deviceInfo.counter_retries,
      counter_received: deviceInfo.counter_received,
      counter_sent: deviceInfo.counter_sent
    }
  }, function(err, up) {
    if (err) console.error('error update doc : ', err);
    //console.log('update : ', up);
    return cb(null, true);
  });

  /*
   this.redisClient.set(internalid, JSON.stringify(deviceInfo), function(err, res){
   if(err) return cb(err);
   that.redisClient.save(function(err, res){
   return cb(null, true);
   });
   });
   */
};

//get device information from redis server ...
MySensorNode.prototype.getDeviceInfo = function(radioId, childId, cb) {
  if (childId == 255) return cb(null, null);
  if (radioId == 0 && childId == 0) return cb(null, null);
  var internalId = radioId + ',' + childId;
  this.sails.models.Sensor.find({ deviceId : radioId, sensorId : childId}).exec(function(err, s){
    if(err) sails.log('error', 'Error GetDeviceInfo : ', err);
    if(s == null) return cb(null, null);
    return cb(null, s);
  });
}
exports = module.exports = MySensorNode;
