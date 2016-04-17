'use strict'
const TelldusDimmer    = require('./telldus-dimmer')
const TelldusSwitch   =  require('./telldus-switch')

class TelldusAccessoryFactory {
  constructor(data, log, homebridge, config) {
    const modelPair = data.model ? data.model.split(':') : ['N/A', 'N/A']
    this.model = modelPair[0]

    switch (this.model) {
      case 'selflearning-dimmer':
          return new TelldusDimmer(data, log, homebridge, config)
        break;
      case 'codeswitch':
      case 'selflearning-switch':
        return new TelldusSwitch(data, log, homebridge, config)
        break;
      default:

    }

  }
}

module.exports = TelldusAccessoryFactory
