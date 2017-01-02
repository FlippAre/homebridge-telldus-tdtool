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
            this.addEventListener(telldusAccessories)
            callback(telldusAccessories) //flatten)
          }
        });
      }
    });
  }

  addEventListener(telldusAccessories){
    var listener = telldus.addRawDeviceEventListener(function(controllerId, data) {
      eventData = data.split(";").reduce((prev, property) => {
        prev[`${property.split(":")[0]}`] = property.split(":")[1]
        return prev
      }
      , {})
  
      if(eventData.class == "sensor") {
        eventData.id = `sensor${eventData.id}`
      }

      a = telldusAccessories.find(accessory => accessory.id == eventData.id )
      if(a instanceof TelldusDoor){
        a.respondToEvent(eventData.state)
      }else if(a instanceof TelldusTemperature){
        a.respondToEvent(eventData.temp)
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
