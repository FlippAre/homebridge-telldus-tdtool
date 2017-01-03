'use strict'

const TelldusAccessoryFactory    = require('./lib/telldus-accessory-factory')
const telldus                    = require('telldus');
const TelldusDoor                = require('./lib/telldus-door')
const TelldusTemperature         = require('./lib/telldus-temperature')

/**
 * Platform wrapper that fetches the accessories connected to the
 * Tellstick via the CLI tool tdtool.
 */
class TelldusTDToolPlatform {
  constructor(log, config, homebridge) {

    this.log = log
    this.config = config
    this.homebridge = homebridge
    this.telldusAccessoryFactory = new TelldusAccessoryFactory(log, config, homebridge)
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
        telldus.getSensors((err, sensors) => {
          if ( err ) {
            console.log('Error: ' + err);
          }
          else{
            const sensorLen = sensors.length
            this.log(
              `Found ${sensorLen || 'no'} item${sensorLen != 1 ? 's' : ''} of type "sensors".`
            )

            let rawAccessories = devices.concat(
              sensors.map(
                s => {
                  s.type = 'SENSOR'
                  return s
                }
              )
            )

            let telldusAccessories = rawAccessories
              .map(accessory =>
                this.telldusAccessoryFactory.build(accessory))
              .filter(a => a != null)
            this.addEventListeners(telldusAccessories)
            callback(telldusAccessories) //flatten)
          }
        });
      }
    });
  }

  addEventListeners(telldusAccessories) {
    telldus.addDeviceEventListener((deviceId, status) => {
      telldusAccessories.find(accessory => accessory.id == deviceId ).respondToEvent(status)
    })

    telldus.addSensorEventListener((deviceId,protocol,model,type,value,timestamp) => {
      let id = `sensor${deviceId}`
      telldusAccessories.find(accessory => accessory.id == id ).respondToEvent(value)
    })
  }
}

/*
 * Register the Telldus tdtool platform as this module.
 */
module.exports = homebridge => {
  homebridge.registerPlatform(
    'homebridge-telldus-tdtool', "Telldus-TD-Tool", TelldusTDToolPlatform)
};
