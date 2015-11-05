/**
* Reading.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    sensorId : {type : 'integer'},
    deviceId : {type : 'integer'},
    internalId : {type : 'string'},
    type : {type : 'integer'},
    deviceTypeString : {type : 'string'},
    value : {type : 'float'}
  }
};

