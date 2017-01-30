'use strict'

const TelldusAccessoryFactory    = require('./lib/telldus-accessory-factory')
const telldus                    = require('telldus');
const TelldusDoor                = require('./lib/telldus-door')
const sqlite3                    = require('sqlite3')
const path                       = require('path')

/**
 * Platform wrapper that fetches the accessories connected to the
 * Tellstick via the CLI tool tdtool.
 */
class TelldusTDToolPlatform {
  constructor(log, config, homebridge) {

    this.log = log
    this.config = config
    this.homebridge = homebridge
    let db = new sqlite3.Database(path.join(homebridge.user.storagePath(), "persist", "telldus.db"));
    db.serialize(function() {
      db.run("CREATE TABLE IF NOT EXISTS dimmer (dimmer_id INTEGER, value INTEGER, UNIQUE(dimmer_id))")
      db.run("CREATE TABLE IF NOT EXISTS sensor (sensor_id TEXT, type TEXT, datetime DATETIME, value REAL)")
    });
    this.telldusAccessoryFactory = new TelldusAccessoryFactory(log, config, homebridge, db)
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
      let a = telldusAccessories.find(accessory => accessory.id == deviceId )
      if(a && a.respondToEvent){
        a.respondToEvent(status)
      }
    })

    telldus.addSensorEventListener((deviceId,protocol,model,type,value,timestamp) => {
      let id = `sensor${deviceId}`
      let a = telldusAccessories.find(accessory => accessory.id == id )
      if(a && a.respondToEvent){
        a.respondToEvent(type, value)
      }
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
