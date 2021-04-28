const env = require('../../../others/env');
var headset = require('./headset');
var edge = require('electron-edge-js');
var path = require('path')

'use strict';
var _this;

class CommonHeadsetSeries extends headset {
    constructor(hid) {
        env.log('CommonHeadsetSeries','CommonHeadsetSeries class','begin');
        super();
        _this = this;
        _this.hid = hid;
        _this.A80sControlMode = edge.func({
            assemblyFile: path.join(env.appDBRoot,'A08sdll.dll'),
            typeName: 'A08sdll.Class1',
            methodName: 'ControlMode'
        })
    }

    static getInstance(hid) {
        if (this.instance) {
            env.log('CommonHeadsetSeries', 'getInstance', `Get exist CommonHeadsetSeries() INSTANCE`);
            return this.instance;
        }
        else {
            env.log('CommonHeadsetSeries', 'getInstance', `New CommonHeadsetSeries() INSTANCE`);
            this.instance = new CommonHeadsetSeries(hid);

            return this.instance;
        }
    }

    InitialDevice(dev, obj, callback) {
        env.log('PrimerSeries','InitialDevice','InitialDevice');
        dev.m_bSetSyncEffect = false;
        dev.m_bSetHWDevice = false;//SET Device
        dev.m_bLaunchprogram = false;
        callback();
    }
}

module.exports = CommonHeadsetSeries;