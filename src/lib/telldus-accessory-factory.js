'use strict'
const TelldusDimmer      = require('./telldus-dimmer')
const TelldusSwitch      = require('./telldus-switch')
const TelldusDoor        = require('./telldus-door')
const TelldusTemperature = require('./telldus-door')

class TelldusAccessoryFactory {
  constructor(data, log, homebridge, config) {

    const configuredAccessory = config.accessories.find(a => a.name === data.name)
    if (configuredAccessory){
      this.model = configuredAccessory.model
    }else{
      const modelPair = data.model ? data.model.split(':') : ['N/A', 'N/A']
      this.model = modelPair[0]
    }

    switch (this.model) {
      case 'selflearning-dimmer':
          return new TelldusDimmer(data, log, homebridge, config)
        break;
      case 'codeswitch':
      case 'selflearning-switch':
        return new TelldusSwitch(data, log, homebridge, config)
        break;
      case 'door':
        console.log("door");
        return new TelldusDoor(data, log, homebridge, config)
      case 'temperaturehumidity':
        return new TelldusTemperature(data, log, homebridge, config)
      default:

    }

  }
}

module.exports = TelldusAccessoryFactory
