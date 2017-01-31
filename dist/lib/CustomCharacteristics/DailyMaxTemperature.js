'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Homebridge = require('homebridge');

var DailyMaxTemperature = function (_Homebridge$Character) {
    _inherits(DailyMaxTemperature, _Homebridge$Character);

    function DailyMaxTemperature() {
        _classCallCheck(this, DailyMaxTemperature);

        var _this = _possibleConstructorReturn(this, (DailyMaxTemperature.__proto__ || Object.getPrototypeOf(DailyMaxTemperature)).call(this));

        Characteristic.call(_this, 'Daily Max Temp', '00000011-0000-1000-8000-MAX6BB765291');
        _this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: Characteristic.Units.CELSIUS,
            maxValue: 100,
            minValue: -100,
            minStep: 0.1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        _this.value = _this.getDefaultValue();
        return _this;
    }

    return DailyMaxTemperature;
}(Homebridge.Characteristic);