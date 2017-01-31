const Homebridge = require('homebridge')

class DailyMaxTemperature extends Homebridge.Characteristic {
    constructor() {
        super()
        Characteristic.call(this, 'Daily Max Temp', '00000011-0000-1000-8000-MAX6BB765291');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: Characteristic.Units.CELSIUS,
            maxValue: 100,
            minValue: -100,
            minStep: 0.1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    }

}
