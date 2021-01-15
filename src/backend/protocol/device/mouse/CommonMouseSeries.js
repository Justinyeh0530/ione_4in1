const env = require('../../../others/env');
var Mouse = require('./Mouse');

'use strict';
var _this;

class CommonMouseSeries extends Mouse {
    constructor(hid) {
        env.log('CommonMouseSeries','CommonMouseSeries class','begin');
        super();
        _this = this;
        _this.hid = hid;
    }

    static getInstance(hid) {
        if (this.instance) {
            env.log('CommonMouseSeries', 'getInstance', `Get exist CommonMouseSeries() INSTANCE`);
            return this.instance;
        }
        else {
            env.log('CommonMouseSeries', 'getInstance', `New CommonMouseSeries() INSTANCE`);
            this.instance = new CommonMouseSeries(hid);

            return this.instance;
        }
    }
}

module.exports = CommonMouseSeries;