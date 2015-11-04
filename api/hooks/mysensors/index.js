/**
 * Created by enicky on 4/11/2015.
 */

module.exports = function mySimpleHook(sails) {

  return {
    startMySensorsProcess: function(){
      sails.log('debug','Starting the Process to poll for the serial port ... ');
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
