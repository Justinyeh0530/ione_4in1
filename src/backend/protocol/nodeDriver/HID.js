var env = require('../../others/env');

'use strict';

var HID = (function () {
    var _this;
    function HID() {
        _this = this;
        if(env.isWindows) {
            _this.hid = require(`./${env.arch}/hiddevice.node`)
        } else if(env.isMac) {
            _this.hid = require('./darwin/hiddevicemac.node')
        }

        if(_this.hid === undefined)
            throw new Error('Hid not init');
    }

    HID.prototype.FindDevice = function(usagepage,usage,vid,pid) {
        return _this.hid.FindDevice(parseInt(usagepage),parseInt(usage),parseInt(vid),parseInt(pid));
    }
    HID.prototype.DeviceDataCallback = function(usagepage,usage,vid,pid,EP3Func) {
        return _this.hid.DeviceDataCallback(parseInt(usagepage),parseInt(usage),parseInt(vid),parseInt(pid),EP3Func);
    }

    HID.prototype.SetFeatureReport = function(DeviceId,param1,param2,buf) {
        return _this.hid.SetFeatureReport(DeviceId,param1,param2,buf);
    }
    HID.prototype.GetFeatureReport = function(DeviceId,param1,param2) {
        return _this.hid.GetFeatureReport(DeviceId,param1,param2);
    }
    HID.prototype.GetFWVersion = function(DeviceId) {
        return _this.hid.GetFWVersion(DeviceId);
    }
    
    

    HID.prototype.hid = undefined;
    return HID;
})();

exports.HID = HID;
exports.HIDInstance = new HID();