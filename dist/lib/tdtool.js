'use strict';

var confParser = require('tellstick.conf-parser');

var LINE_DELIMETER = '\n';
var PAIR_DELIMETER = '\t';

var exec = require('child_process').exec;

var execute = function execute(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, function (err, stdout, stderr) {
      return err ? reject(stderr) : resolve(stdout);
    });
  });
};

/**
 * Wrapper for CMD interaction with
 * @type {Object}
 */
var TDtool = {
  isInstalled: function isInstalled() {
    return execute('command -v tdtool').then(function (res) {
      return res !== '' ? Promise.resolve() : Promise.reject('"tdtool" does not seem to be installed, but is required by this plugin.');
    });
  },

  listDevices: function listDevices() {
    return TDtool.isInstalled().then(function () {
      return execute('tdtool --list-devices');
    }).then(function (deviceString) {
      return confParser.parse('/etc/tellstick.conf').then(function (conf) {
        return deviceString.split(LINE_DELIMETER).map(function (line) {
          return line.split(PAIR_DELIMETER).reduce(function (obj, unparsedPair) {
            var pair = unparsedPair.split('=');
            if (pair[0]) obj[pair[0]] = pair[0] === 'id' ? parseInt(pair[1]) : pair[1];
            return obj;
          }, {});
        }).filter(function (device) {
          return !!device.id;
        }).map(function (device) {
          return Object.assign(conf.devices.find(function (confDev) {
            return confDev.id === device.id;
          }), device);
        });
      });
    });
  },

  device: function device(id) {
    return TDtool.listDevices().then(function (devices) {
      return devices.find(function (d) {
        return d.id === id;
      });
    });
  },

  run: function run(cmd, target) {
    return TDtool.isInstalled().then(function () {
      return execute('tdtool ' + cmd + ' ' + target);
    });
  },

  /**
   * Shorthand methods for running a command on a Device with the given
   * Device ID.
   *
   * @param  {[type]} TDtool [description]
   * @param  {[type]} '--on' [description]
   * @return {[type]}        [description]
   */
  on: function on(id) {
    return TDtool.run('--on', id);
  },
  off: function off(id) {
    return TDtool.run('--off', id);
  },
  dim: function dim(id) {
    return TDtool.run('--dim', id);
  },
  dimlevel: function dimlevel(level) {
    return TDtool.run('--dimlevel', level);
  }
};

module.exports = TDtool;