const env = require('../../../others/env');
const logger  = require('../../../others/logger')
const loggertitle = "headset"
var Device = require('../Device')
var nedbObj = require('../../../dbapi/AppDB')
var evtType = require('../../../others/EventVariable').EventTypes;

'use strict';
var _this;

class Headset extends Device {
    constructor() {
        env.log('Headset','Keyboardclass','begin');
        super();
        _this = this;
        _this.nedbObj = nedbObj.getInstance();
    }

    static getInstance() {
        if (this.instance) {
            env.log('Headset', 'getInstance', `Get exist Headset() INSTANCE`);
            return this.instance;
        }
        else {
            env.log('Headset', 'getInstance', `New Headset() INSTANCE`);
            this.instance = new Headset();

            return this.instance;
        }
    }

    initDevice(dev) {
        var _this = this;
        env.log('Headset','initDevice','begin')
        return new Promise(function(resolve, reject) {
            _this.nedbObj.getDevice(dev.BaseInfo.SN).then((exist) => {
                if(exist) {
                    dev.deviceData = exist;
                    _this.InitialDevice(dev,0,function(){
                        resolve();
                    });
                } else {
                    _this.SaveProfileToDevice(dev, (data) => {                       
                        dev.deviceData = data;
                        _this.InitialDevice(dev,0,function(){
                            resolve();
                        });
                    });
                }
            })
        })
    }

    SaveProfileToDevice(dev, callback) {
        env.log('Device', 'SaveProfileToDevice', `SaveProfileToDevice`);
        var _this = this;
        var BaseInfo = dev.BaseInfo;
        var profile = BaseInfo.defaultProfile
        var profileLayerIndex = BaseInfo.profileLayerIndex;
        var profileLayers = BaseInfo.profileLayers;
        var layerMaxNumber = BaseInfo.layerMaxNumber;
        var obj = {
            vid: BaseInfo.vid,
            pid: BaseInfo.pid,
            SN: BaseInfo.SN,
            devicename: BaseInfo.devicename,
            ModelType: BaseInfo.ModelType,
            image: BaseInfo.img,
            battery: BaseInfo.battery,
            layerMaxNumber: layerMaxNumber,
            profile: profile,
            profileLayerIndex: profileLayerIndex,
            profileLayers: profileLayers,
            profileindex: 0
        }
        _this.nedbObj.AddDevice(obj).then(()=>{                     
            callback(obj)
        })
    }

    ChangeProfileID(dev,Obj, callback) {
        var _this = this;
        env.log('ModelOSeries','ChangeProfileID',`${Obj}`)
        try{
            var Data = Buffer.alloc(256);
            dev.deviceData.profileindex = Obj;
            var iLayerIndex = dev.deviceData.profileLayerIndex[Obj];

            Data[0] = 0x07;
            Data[1] = 0x01;
            Data[2] = Obj+1;
            Data[3] = iLayerIndex+1;
            //-----------------------------------
            _this.SetFeatureReport(dev, Data,50).then(function () {
                _this.setProfileToDevice(dev,function(){
                    callback("ChangeProfileID Done");
                })
            });
        } catch(e) {
            env.log('ModelOSeries','SetKeyMatrix',`Error:${e}`);
            logger.error(loggertitle,'ChangeProfileID', `${e}`)
            callback();
        }
    }

    /**
     * Mouse change Headset Profile
     * @param {*} obj 1:up 2:down
     */
    ChangeProfile(dev, obj) {
        new Promise((resolve,reject) =>{
            var _this = this;
            if(obj == 1)
                dev.deviceData.profileindex++;
            if(obj == 2)
                dev.deviceData.profileindex--;
            if(dev.deviceData.profileindex >= dev.deviceData.profile.length)
                dev.deviceData.profileindex = 0;
            else if(dev.deviceData.profileindex < 0)
                dev.deviceData.profileindex = dev.deviceData.profile.length-1;
            _this.ChangeProfileID(dev, dev.deviceData.profileindex, function(data){
                _this.setProfileToDevice(dev, function(data){
                    var ObjProfileIndex ={Profile:dev.deviceData.profileindex, LayerIndex:dev.deviceData.profileLayerIndex[dev.deviceData.profileindex], SN:dev.BaseInfo.SN};
                    var Obj2 = {
                        Func: evtType.SwitchUIProfile,
                        SN: dev.BaseInfo.SN,
                        Param: ObjProfileIndex
                    };
                    _this.emit(evtType.ProtocolMessage, Obj2);
                    resolve();
                });
            })
        });
    }

    /**
     * Mouse change Headset Layer
     * @param {*} obj 1:up 2:down
     */
    ChangeLayer(dev, obj) {
        new Promise((resolve,reject) =>{
            var _this = this;
            if(obj == 1)
                dev.deviceData.profileLayerIndex[dev.deviceData.profileindex]++;
            if(obj == 2)
                dev.deviceData.profileLayerIndex[dev.deviceData.profileindex]--;
            if(dev.deviceData.profileLayerIndex[dev.deviceData.profileindex] >= dev.deviceData.profileLayerIndex.length)
                dev.deviceData.profileLayerIndex[dev.deviceData.profileindex] = 0;
            else if(dev.deviceData.profileLayerIndex[dev.deviceData.profileindex] < 0)
                dev.deviceData.profileLayerIndex[dev.deviceData.profileindex] = dev.deviceData.profileLayerIndex.length-1;
            _this.ChangeProfileID(dev, dev.deviceData.profileindex, function(data){
                _this.setProfileToDevice(dev, function(data){
                    var ObjProfileIndex ={Profile:dev.deviceData.profileindex, LayerIndex:dev.deviceData.profileLayerIndex[dev.deviceData.profileindex], SN:dev.BaseInfo.SN};
                    var Obj2 = {
                        Func: evtType.SwitchUIProfile,
                        SN: dev.BaseInfo.SN,
                        Param: ObjProfileIndex
                    };
                    _this.emit(evtType.ProtocolMessage, Obj2);
                    resolve();
                });
            })
        });
    }
}

module.exports = Headset;