'use strict'

const telldus                             = require('telldus')
const TelldusAccessory                    = require('./telldus-accessory')
const inherits                            = require('util').inherits;

/**
 * An Accessory convenience wrapper.
 */

class TelldusTemperature extends TelldusAccessory {

  /**
   * Inject everything used by the class. No the neatest solution, but nice for
   * testing purposes, and avoiding globals as we don't know anything about
   * Service, Characteristic and other Homebridge things that are injected
   * into exported provider function.
   *
   * @param  {object}  data       The object representation of the device.
   * @param  {hap.Log} log        The log to use for logging.
   * @param  {API}     homebridge The homebridge API, with HAP embedded
   * @param  {object}  config     Configuration object passed on from initial
   *                              instantiation.
   */
  constructor(data, log, homebridge, config, db) {
    super(data, log, homebridge, config)
    this.id = "sensor" + data.id
    this.service = new this.Service.TemperatureSensor(this.name)
    this.db = db
    let [DailyMaxTemperature, DailyMinTemperature, MonthlyMinTemperature, MonthlyMaxTemperature] = this._createCustomCharacteristics(homebridge.hap.Characteristic)
    
    this.service.addCharacteristic(this.Characteristic.CurrentRelativeHumidity)
    this.service.addCharacteristic(DailyMaxTemperature)
    this.service.addCharacteristic(DailyMinTemperature)
    this.service.addCharacteristic(MonthlyMinTemperature)
    this.service.addCharacteristic(MonthlyMaxTemperature)

    // Should work with negative values
    this.service
    .getCharacteristic(this.Characteristic.CurrentTemperature)
    .props.minValue = -50;

    this.service
    .getCharacteristic(this.Characteristic.CurrentTemperature)
    .on('get', this.getCurrentTemperature.bind(this))

    this.service
    .getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
    .on('get', this.getCurrentHumidity.bind(this))

    this.service
    .getCharacteristic(DailyMaxTemperature)
    .on('get', this.getDailyMaxTemperature.bind(this))

    this.service
    .getCharacteristic(DailyMinTemperature)
    .on('get', this.getDailyMinTemperature.bind(this))

    this.service
    .getCharacteristic(MonthlyMaxTemperature)
    .on('get', this.getMonthlyMaxTemperature.bind(this))

    this.service
    .getCharacteristic(MonthlyMinTemperature)
    .on('get', this.getMonthlyMinTemperature.bind(this))

    this.meta
    .setCharacteristic(this.Characteristic.Model, "TemperatureSensor")

  }

  /**
   * Get the temperatur
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */
  getCurrentTemperature(callback) {
    this.log("Getting temperature...");

      telldus.getSensors((err, sensors) => {
        if (!!err) callback(err, null)
        let temperaturSensor = sensors.find((sensor) => `sensor${sensor.id}` === this.id)
        let temperature = temperaturSensor.data.find((data) => data.type === "TEMPERATURE").value
        this.log("Temperatur is: " + temperature)
        callback(null, parseFloat(temperature))
      })
  }

    /**
   * Get the humidity
   *
   * @param  {Function}           callback       To be invoked when result is
   *                                             obtained.
   */
  getCurrentHumidity(callback) {
    this.log("Getting humidity...");

      telldus.getSensors((err, sensors) => {
        if (!!err) callback(err, null)
        let temperaturSensor = sensors.find((sensor) => "sensor" + sensor.id === this.id)
        let humidity = temperaturSensor.data.find((data) => data.type === "HUMIDITY").value
        this.log("Humidity is: " + humidity)
        callback(null, parseFloat(humidity))
      })
  }

  getDailyMaxTemperature(callback){
    this.db.serialize(() => {
      this.db.each( this._buildSQL("MAX", "day"), (err, row) => {
        callback(null, row.value)
      });
    });
  }

  getDailyMinTemperature(callback){
    this.db.serialize(() => {
      this.db.each( this._buildSQL("MIN", "day"), (err, row) =>{
        callback(null, row.value)
      });
    });
  }

  getMonthlyMaxTemperature(callback){
    this.db.serialize(() => {
      this.db.each(
        this._buildSQL("MAX", "month"), (err, row) =>{
          callback(null, row.value)
      });
    });
  }

  getMonthlyMinTemperature(callback){
    this.db.serialize(() => {
      this.db.each(
        this._buildSQL("Min", "month"), (err, row) =>{
          callback(null, row.value)
      });
    });
  }

  _buildSQL(operator, time){
    `SELECT ${operator}(value) as value
      FROM sensor 
      WHERE sensor_id = '${this.id}'
      AND datetime > datetime('now','start of ${time}')`
  }

  respondToEvent(type, value) {
      if(type == 1){ 
        this.log(`Got temperatur update: ${value} for ${this.name}`)
        this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
          .setValue(parseFloat(value)
        )
        let datetime = new Date().toISOString()
        this.db.serialize(() => {
          this.db.run(`INSERT INTO sensor(sensor_id, type , datetime, value)
                      VALUES('${this.id}', 'temperatur', datetime('${datetime}'), ${value})`);
        })
      }else{
        this.log(`Got humidity update: ${value} for ${this.name}`)
        this.service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
          .setValue(parseFloat(value)
        )
      }
  }

  _createCustomCharacteristics(Characteristic){
    let customCharacteristics = []

    let props = {
        format: Characteristic.Formats.FLOAT,
        unit: Characteristic.Units.CELSIUS,
        maxValue: 100,
        minValue: -100,
        minStep: 0.1,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    }

    let DailyMaxTemperature = function () {
      Characteristic.call(this, 'Daily Max Temperature', '422693A4-2703-4AE2-AF6A-8D40B2DE3A33');
      this.setProps(props);
      this.value = this.getDefaultValue();
    };
    inherits(DailyMaxTemperature, Characteristic);
    customCharacteristics.push(DailyMaxTemperature)

    let DailyMinTemperature = function () {
      Characteristic.call(this, 'Daily Min Temperature', '422693A5-2703-4AE2-AF6A-8D40B2DE3A33');
      this.setProps(props);
      this.value = this.getDefaultValue();
    };
    inherits(DailyMinTemperature, Characteristic);
    customCharacteristics.push(DailyMinTemperature)

    let MonthlyMinTemperature = function () {
      Characteristic.call(this, 'Monthly Min Temperature', '422693A6-2703-4AE2-AF6A-8D40B2DE3A33');
      this.setProps(props);
      this.value = this.getDefaultValue();
    };
    inherits(MonthlyMinTemperature, Characteristic);
    customCharacteristics.push(MonthlyMinTemperature)

    let MonthlyMaxTemperature = function () {
      Characteristic.call(this, 'Monthly Max Temperature', '422693A7-2703-4AE2-AF6A-8D40B2DE3A33');
      this.setProps(props);
      this.value = this.getDefaultValue();
    };
    inherits(MonthlyMaxTemperature, Characteristic);
    customCharacteristics.push(MonthlyMaxTemperature)

    return customCharacteristics

  }

}



// select min(value) from sensor where sensor_id = 'sensor12' and datetime > datetime('now','start of day')
module.exports = TelldusTemperature
