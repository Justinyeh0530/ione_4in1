const env = require('../../../others/env');
var Device = require('../Device')
var nedbObj = require('../../../dbapi/AppDB')

'use strict';
var _this;

class Mouse extends Device {
    constructor() {
        env.log('Mouse','Mouseclass','begin');
        super();
        _this = this;
        _this.nedbObj = nedbObj.getInstance();
    }

    static getInstance() {
        if (this.instance) {
            env.log('Mouse', 'getInstance', `Get exist Mouse() INSTANCE`);
            return this.instance;
        }
        else {
            env.log('Mouse', 'getInstance', `New Mouse() INSTANCE`);
            this.instance = new Mouse();

            return this.instance;
        }
    }

    initDevice(dev) {
        var _this = this;
        env.log('Mouse','initDevice','begin')
        return new Promise(function(resolve, reject) {
            _this.nedbObj.getDevice(dev.BaseInfo.SN).then((exist) => {
                if(exist) {
                    dev.deviceData = exist;
                    _this.InitialDevice(dev,0,function(){
                        _this.OnTimerGetBattery(dev, function(){
                        });
                        resolve();
                    });
                    
                } else {
                    _this.SaveProfileToDevice(dev,(data) => {
                        dev.deviceData = data;
                        _this.InitialDevice(dev,0,function(){
                            _this.OnTimerGetBattery(dev, function(){
                            });
                            resolve();
                        });
                    });
                }
            })
        })
    }
}

module.exports = Mouse;