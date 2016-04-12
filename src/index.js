'use strict'

const TelldusAccessory = require('./lib/telldus-accessory')
const telldus          = require('telldus');

/**
 * Platform wrapper that fetches the accessories connected to the
 * Tellstick via the CLI tool tdtool.
 */
class TelldusTDToolPlatform {
  constructor(log, config, homebridge) {

    this.log = log
    this.config = config
    this.homebridge = homebridge
  }

  accessories(callback) {
    this.log('Loading devices...')
    telldus.getDevices( (err, devices) => {
      if ( err ) {
        console.log('Error: ' + err);
      } else {
        // The list of devices is returned
        const len = devices.length
        this.log(
          `Found ${len || 'no'} item${len != 1 ? 's' : ''} of type "device".`
        )

        console.log(devices.map(data =>
          new TelldusAccessory(data, this.log, this.homebridge, this.config)))

        callback(devices.map(data =>
          new TelldusAccessory(data, this.log, this.homebridge, this.config)))
      }
    });
  }
}

/*
 * Register the Telldus tdtool platform as this module.
 */
module.exports = homebridge => {
  homebridge.registerPlatform(
    'homebridge-telldus-tdtool', "Telldus-TD-Tool", TelldusTDToolPlatform)
};
