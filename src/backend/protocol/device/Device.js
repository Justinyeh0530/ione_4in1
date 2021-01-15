const EventEmitter = require('events');
const env = require('../../others/env');
const { Logger } = require('log4js');
var openurl = require('electron').shell;
var evtType = require('../../others/EventVariable').EventTypes;

'use strict'
class Device extends EventEmitter {
    constructor() {
        env.log('Device','Device class','begin');
        super();
    }

    static getInstance() {
        if (this.instance) {
            env.log('Device', 'getInstance', `Get exist Device() INSTANCE`);
            return this.instance;
        }
        else {
            env.log('Device', 'getInstance', `New Device() INSTANCE`);
            this.instance = new Device();

            return this.instance;
        }
    }

    SaveProfileToDevice(dev, callback) {
        env.log('Device', 'SaveProfileToDevice', `SaveProfileToDevice`);
        var _this = this;
        var BaseInfo = dev.BaseInfo;
        var profile = BaseInfo.defaultProfile
        var obj = {
            vid: BaseInfo.vid,
            pid: BaseInfo.pid,
            SN: BaseInfo.SN,
            devicename: BaseInfo.devicename,
            ModelType: BaseInfo.ModelType,
            image: BaseInfo.img,
            battery: BaseInfo.battery,
            profile: profile,
            profileindex: 1
        }
        _this.nedbObj.AddDevice(obj).then(()=>{                     
            callback(obj)
        })
    }


    setProfileToDevice(dev, callback) {
        env.log('Device','setProfileToDevice','Begin')
        var _this = this;
        // dev.deviceData.profile = obj
        _this.nedbObj.updateDevice(dev.BaseInfo.SN, dev.deviceData)
        callback();
    }

    ChangeProfile(dev, obj, callback) {
        try {
            var _this = this;
            _this.ChangeProfileID(dev, obj,function (params) {
                callback(obj);
            });
        } catch(e) {
            env.log('Device','ChangeProfile',`${e}`)
            callback();
        }
    }
    GetBatteryStats(dev, obj, callback) {
        env.log('Device','GetBatteryStats','Begin')
        var _this = this; 
        if(env.BuiltType == 1) {
            callback(0);
            return;
        }
        _this.GetDeviceBatteryStats(dev,0,function (ObjBattery) {
            callback(ObjBattery);
        });
    }

    hexToRgb(InputData) {
        try {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(InputData);
            return result ?              
            {
                color:{
                R: parseInt(result[1], 16),
                G: parseInt(result[2], 16),
                B: parseInt(result[3], 16)
                } 
            }
            : null;
        }
        catch{
            return 1;
        }
    }
    padLeft(num,numZeros){
        var n = Math.abs(num);
        var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
        var zeroString = Math.pow(10,zeros).toString().substr(1);
        if( num < 0 ) {
            zeroString = '-' + zeroString;
        }
    
        return zeroString+n;

    }
    RunApplication(obj,callback){
        env.log('DeviceApi RunApplication','RunApplication',JSON.stringify(obj))
        if(env.isWindows){
           openurl.openExternal(obj);
            // exec(obj,function(err,data){
            //     // if(err)
            //     //     callback(err)
            //     // else
            //     //     callback(true);
            // })
        }else{
            obj = 'open -nF '+obj
            exec(obj,{shell: '/bin/bash'},function(err,data){
                // if(err)
                //     callback(err)
                // else
                //     callback(true);
            })
        }
    }

    /**
     * Import Profile
     * @param {*} obj import profile Data
     */
    ImportProfile(dev, obj, callback) {
        var _this = this; 
        env.log('DeviceApi ImportProfile','ImportProfile',JSON.stringify(obj));
        let ProfileIndex = dev.deviceData.profile.findIndex(x => x.profileid == obj.profileid)
        if(ProfileIndex != -1) {
            dev.deviceData.profile[ProfileIndex] = obj;
            _this.SetImportProfileData(dev,0,function () {
                callback();
            });
        }
    }

    SleepTime(dev, obj, callback) {
        env.log('DeviceApi','SleepTime',JSON.stringify(obj));
        var _this = this;
        _this.SetSleepTimetoDevice(dev,obj,function () {
            callback();
        });
    }
    NumTo16Decimal(rgb) {//HEX
        var hex = Number(rgb).toString(16).toUpperCase();
        
		while (hex.length < 4)
        {
            hex = "0" + hex;
        }
        return hex;
    };
    DeleteBatteryTimeout(dev,Obj,callback){
        if (dev.m_TimerGetBattery  != undefined) {
            clearInterval(dev.m_TimerGetBattery);
        }
        callback();
    }
    OnTimerGetBattery(dev,callback) {
        var _this = this; 
        if (dev.m_TimerGetBattery  != undefined) {
            clearInterval(dev.m_TimerGetBattery);
        }
        dev.m_TimerGetBattery = setInterval(() => {
            try{
                _this.GetBatteryStats(dev,0,function (ObjBattery) {
                    //-----------emit-------------------
                    var Obj2 = {
                        Func: evtType.GetBatteryStats,
                        SN: dev.BaseInfo.SN,
                        Param: ObjBattery
                    };
                    if (ObjBattery.Status == 0) {
                        _this.emit(evtType.ProtocolMessage, Obj2);
                    }
                    callback();
                });
            } catch(e) {
                env.log('ModelOSeries','SetKeyMatrix',`Error:${e}`);
                callback();
            }
        },60000);
    }
}

module.exports = Device;