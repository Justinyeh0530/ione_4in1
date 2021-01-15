const env = require('../../../others/env');
var keyboard = require('./keyboard');

'use strict';
var _this;

class CommonKeyboardSeries extends keyboard {
    constructor(hid) {
        env.log('CommonKeyboardSeries','CommonKeyboardSeries class','begin');
        super();
        _this = this;
        _this.hid = hid;
    }

    static getInstance(hid) {
        if (this.instance) {
            env.log('CommonKeyboardSeries', 'getInstance', `Get exist CommonKeyboardSeries() INSTANCE`);
            return this.instance;
        }
        else {
            env.log('CommonKeyboardSeries', 'getInstance', `New CommonKeyboardSeries() INSTANCE`);
            this.instance = new CommonKeyboardSeries(hid);

            return this.instance;
        }
    }
}

module.exports = CommonKeyboardSeries;