'use strict'
const TelldusDimmer      = require('./telldus-dimmer')
const TelldusSwitch      = require('./telldus-switch')
const TelldusDoor        = require('./telldus-door')
const TelldusTemperature = require('./telldus-temperature')
const TelldusHumidity    = require('./telldus-humidity')

class TelldusAccessoryFactory {
  constructor(log, config, homebridge, db) {
    this.log = log
    this.config = config
    this.homebridge = homebridge
    this.db = db
  }

  build(rawAccessory){
    const configuredAccessory = this.config.accessories.find(a => a.id === rawAccessory.id && a.type === rawAccessory.type)
    if (configuredAccessory && configuredAccessory.model){
      this.model = configuredAccessory.model
    }else{
      const modelPair = rawAccessory.model ? rawAccessory.model.split(':') : ['N/A', 'N/A']
      this.model = modelPair[0]
    }

    switch (this.model) {
      case 'selflearning-dimmer':
          return new TelldusDimmer(rawAccessory, this.log, this.homebridge, this.config, this.db)
        break;
      case 'codeswitch':
      case 'selflearning-switch':
        return new TelldusSwitch(rawAccessory, this.log, this.homebridge, this.config)
        break;
      case 'door':
        return new TelldusDoor(rawAccessory, this.log, this.homebridge, this.config)
        break;
      case 'temperaturehumidity':
        console.log('temperaturehumidity');
        if(configuredAccessory){
          rawAccessory.name = configuredAccessory.name
          let telldusTemperature = new TelldusTemperature(rawAccessory, this.log, this.homebridge, this.config, this.db)
          //let telldusHumidity = new TelldusHumidity(rawAccessory, this.log, this.homebridge, this.config)
          return telldusTemperature
        }
        break;
      default:
        return null
        break;
    }
    return null
  }
}

module.exports = TelldusAccessoryFactory
