const EventEmitter = require('events');
const env = require('../../others/env');
const logger = require('../../others/logger')
var nedbObj = require('../../dbapi/AppDB');
var HID = require('../nodeDriver/HID');
var CommonMouseSeries = require('../device/mouse/CommonMouseSeries');
var CommonKeyboardSeries = require('../device/keyboard/CommonKeyboardSeries');
var CommonHeadsetSeries = require('../device/headset/CommonHeadsetSeries');
var funcVar = require('../../others/FunctionVariable');
const { Logger } = require('log4js');
const loggertitle = "DeviceService"
var evtType = require('../../others/EventVariable').EventTypes;
var ApmodeService = require('../apmode/ApmodeService')


'use strict';
var _this;
class DeviceService extends EventEmitter {
    constructor() {
        env.log('DeviceService','DeviceService','begin')
        try {
            super();
            _this = this;
            _this.nedbObj = nedbObj.getInstance();
            _this.SupportDevice = [];
            _this.AllDevices = new Map();
            _this.hid = HID.HIDInstance;
            _this.SetPluginDB = false;

            //------------------ApmodeService------------------
            _this.ApmodeService = ApmodeService.getInstance();
            _this.ApmodeService.on(evtType.ProtocolMessage, _this.OnApmodeMessage)
            // _this.ApmodeService.StartApmode(1,function(){})
            //------------------ApmodeService------------------

        } catch(e) {
            env.log('ERROR','DeviceService',e)
        }
    }

    static getInstance() {
        if (this.instance) {
            env.log('DeviceService', 'getInstance', `Get exist DeviceService() INSTANCE`);
            
            return this.instance;
        }
        else {
            env.log('DeviceService', 'getInstance', `New DeviceService() INSTANCE`);
            this.instance = new DeviceService();

            return this.instance;
        }
    }
    
    OnDeviceMessage(Obj) {
        if (Obj.SN != undefined) {
            var dev = _this.AllDevices.get(Obj.SN);
            if (Obj.Func == "SwitchKeyboardProfile" && global.ChangeProfileLayerFlag == false){
                env.log('DeviceService', 'OnDeviceMessage-SwitchKeyboardProfile', Obj.Updown);//1:Up,2:Down
                _this.ChangeKeyboardProfileLayer(1,Obj.Updown)
            } else if (Obj.Func == "SwitchKeyboardLayer" && global.ChangeProfileLayerFlag == false){
                env.log('DeviceService', 'OnDeviceMessage-SwitchKeyboardLayer', Obj.Updown);//1:Up,2:Down
                _this.ChangeKeyboardProfileLayer(2,Obj.Updown)
            } else{
                _this.emit(evtType.ProtocolMessage, Obj);
            }
        }
    }
    RunFunction(Obj, callback) {
        if(env.BuiltType == 1) {
            callback();
            return;
        }
        try {
            if(Obj.Type == funcVar.FuncType.Apmode) {
                var apmode = _this.ApmodeService[Obj.Func];
                if(apmode === undefined)
                    throw new Error(`Specfun Error: ${Obj.Func}`)
                apmode(Obj.Param, callback);
                return;
            }

            if( _this.AllDevices.size <= 0)
                throw new Error('Please initDevice first');
            
            if( !_this.AllDevices.has(Obj.SN))
                throw new Error('SN is Error');
            
            var dev = _this.AllDevices.get(Obj.SN);;
            var devfun = dev.SeriesInstance[Obj.Func];

            if(devfun === undefined)
                throw new Error(`devfun Error: ${Obj.Func}`)
            
            dev.SeriesInstance[Obj.Func](dev, Obj.Param, callback);

        } catch(e) {
            env.log('DeviceService', 'RunFunction', `Error ${e}`);
        }
    }

    NumTo16Decimal(rgb) {//HEX
        var hex = Number(rgb).toString(16).toUpperCase();
        
		while (hex.length < 4)
        {
            hex = "0" + hex;
        }
        return hex;
    };

    HIDReadDataFromDevice(Obj,Obj2) {
        try {
            if(env.BuiltType == 1) {
                return;
            }
            var EP2Array = Obj;
            var DeviceInfo = Obj2;
            if (DeviceInfo.vid != undefined && DeviceInfo.pid != undefined) {
                var SN;
                var SN = "0x"+ _this.NumTo16Decimal(DeviceInfo.vid) + "0x"+ _this.NumTo16Decimal(DeviceInfo.pid) ;
                var dev = _this.AllDevices.get(SN);
                var devfun = dev.SeriesInstance["HIDReadData"];

                if(devfun === undefined) {
                    env.log('DeviceService','HIDReadDataFromDevice',`${Obj.Func}`);
                }
                else{
                    // console.log('HIDReadData', EP2Array);
                    dev.SeriesInstance["HIDReadData"](dev, EP2Array);
                    let devicename = '', KeyCode = undefined;
                    if((EP2Array[0] == 0x01 && EP2Array[1] == 0x20) || (EP2Array[0] == 0x01 && EP2Array[1] == 0x40))
                        KeyCode = 'LED'
                    else if(EP2Array[0] == 0x01 && EP2Array[1] == 0x80)
                        KeyCode = 'DTS'
                    if(DeviceInfo.vid == '0x195d' && DeviceInfo.pid == '0xa005')
                        devicename = 'A08s'

                    if(KeyCode != undefined) {
                        var ObjEvent = {
                            Type: devicename,//Turing
                            Keycode: KeyCode,
                        };
                        _this.ApmodeService.SyncLEDEvent(ObjEvent);
                    }
                }

            }
            //--------------------
            return; 

        } catch(e) {
            env.log('DeviceService', 'HIDReadDataFromDevice', `Error ${e}`);
        }
    }
    
    initDevice() { 
        env.log('DeviceService','initDevice','begin');
        var filterDevice = [];
        return new Promise((resolve,reject) => {
            _this.GetSupportDevice().then(()=>{  
                for(var i = 0; i < _this.SupportDevice.length; i++) {
                    var result = _this.hid.FindDevice(_this.SupportDevice[i].set.usagepage, _this.SupportDevice[i].set.usage,_this.SupportDevice[i].vid, _this.SupportDevice[i].pid)
                    if(_this.SupportDevice[i].vid.toLowerCase() == '0x195d'|| _this.SupportDevice[i].pid.toLowerCase() == '0xa005')
                        result = 1;
                    if(result != 0 || env.BuiltType != 0) {
                        var sn = _this.SupportDevice[i].vid+_this.SupportDevice[i].pid
                        var dev = {};
                        dev.BaseInfo = _this.SupportDevice[i];
                        dev.BaseInfo.DeviceId = result;
                        dev.BaseInfo.SN = sn;
                        filterDevice.push(dev);

                        //--------------DeviceCallback----------------
                        if(_this.SupportDevice[i].vid.toLowerCase() == '0x195d'&& _this.SupportDevice[i].pid.toLowerCase() == '0xa005') {
                            var rtn = _this.hid.DeviceDataCallback(_this.SupportDevice[i].get.usagepage, _this.SupportDevice[i].get.usage,_this.SupportDevice[i].vid, _this.SupportDevice[i].pid,_this.HIDReadDataFromDevice);
                            env.log('initDevice', 'Init DeviceDataCallback : ', rtn);
                        }
                        //------------------------------
                    }
                }

                filterDevice.reduce((sequence, dev) =>{
                    return sequence.then(() => {
                        _this.AllDevices.set(dev.BaseInfo.SN, dev);
                        return;
                    }).then(() => {
                        return _this.GetDeviceInst(dev);
                    }).catch((e)=> {
                        env.log('DeviceService','initDevice',`Error:${e}`);
                    });
                },Promise.resolve()).then(() => {
                    return _this.SavePluginDevice();
                }).then(() => {
                    resolve();
                }).catch((e) => {
                    env.log('DeviceService','initDevice',`Error:${e}`);
                });
            });
        });
    }

    GetSupportDevice() {
        return new Promise((resolve,reject) => {
            _this.nedbObj.getSupportDevice().then((data)=>{ 
                _this.SupportDevice = data;
                resolve();
            });
        });
    }

    GetDeviceInst(dev) {
        return new Promise(function (resolve, reject) {
            env.log('DeviceService','GetDeviceInst','begin');
            var cmdInst = undefined;
            if(dev.BaseInfo.routerID == "CommonMouseSeries") {
                if(_this.CommonMouseSeries == undefined) {
                    _this.CommonMouseSeries = CommonMouseSeries.getInstance(_this.hid);
                }
                cmdInst = _this.CommonMouseSeries;
            } else if(dev.BaseInfo.routerID == "CommonKeyboardSeries") {
                if(_this.CommonKeyboardSeries == undefined) {
                    _this.CommonKeyboardSeries = CommonKeyboardSeries.getInstance(_this.hid);
                    _this.CommonKeyboardSeries.on(evtType.ProtocolMessage, _this.OnDeviceMessage);
                }
                cmdInst = _this.CommonKeyboardSeries;
            } else if(dev.BaseInfo.routerID == "CommonHeadsetSeries") {
                if(_this.CommonHeadsetSeries == undefined) {
                    _this.CommonHeadsetSeries = CommonHeadsetSeries.getInstance(_this.hid);
                    _this.CommonHeadsetSeries.on(evtType.ProtocolMessage, _this.OnDeviceMessage);
                }
                cmdInst = _this.CommonHeadsetSeries;
            }

            if(cmdInst != undefined) {
                cmdInst.initDevice(dev).then(() => {
                    dev.SeriesInstance = cmdInst;
                    resolve();
                }).catch((e) => {
                    env.log('DeviceService','GetDeviceInst',`err: ${e}`)
                    resolve();
                });
            } else {
                env.log('DeviceService','GetDeviceInst','cmdInst undefined');
                resolve();
            }
        })
    }

    SavePluginDevice() {
        env.log('DeviceService','SavePluginDevice','SavePluginDevice');
        return new Promise((resolve, reject) => {
            let devList = {};
            devList.Keyboard = [];
            devList.Mouse = [];
            devList.Headset = [];
            for(var val of _this.AllDevices.values()) {
                if(val.BaseInfo.ModelType == 1) {
                    var Mouse = {
                        vid: val.BaseInfo.vid,
                        pid: val.BaseInfo.pid,
                        devicename: val.BaseInfo.devicename,
                        ModelType: val.BaseInfo.ModelType,
                        SN: val.BaseInfo.SN,
                        DeviceId: val.BaseInfo.DeviceId,
                        version_Wired: val.BaseInfo.version_Wired,
                        version_Wireless: val.BaseInfo.version_Wireless,
                        // img: val.BaseInfo.img
                    };
                    devList.Mouse.push(Mouse)
                } else if(val.BaseInfo.ModelType == 2) {
                    var Keyboaerd = {
                        vid: val.BaseInfo.vid,
                        pid: val.BaseInfo.pid,
                        devicename: val.BaseInfo.devicename,
                        ModelType: val.BaseInfo.ModelType,
                        SN: val.BaseInfo.SN,
                        DeviceId: val.BaseInfo.DeviceId,
                        version_Wired: val.BaseInfo.version_Wired,
                        version_Wireless: val.BaseInfo.version_Wireless,
                        // img: val.BaseInfo.img
                    };
                    devList.Keyboard.push(Keyboaerd)
                } else if(val.BaseInfo.ModelType == 3) {
                    var Headset = {
                        vid: val.BaseInfo.vid,
                        pid: val.BaseInfo.pid,
                        devicename: val.BaseInfo.devicename,
                        ModelType: val.BaseInfo.ModelType,
                        SN: val.BaseInfo.SN,
                        DeviceId: val.BaseInfo.DeviceId,
                        version_Wired: val.BaseInfo.version_Wired,
                        version_Wireless: val.BaseInfo.version_Wireless,                   
                         // img: val.BaseInfo.img
                    };
                    devList.Headset.push(Headset)
                }
            }
            _this.nedbObj.updateAllPluginDevice(devList).then(() => {
                var Obj2 = {
                    Type: funcVar.FuncType.Device,
                    Func: evtType.RefreshDevice,
                    Param: ''
                };
                _this.emit(evtType.ProtocolMessage, Obj2);
                resolve()
            })
        })
    }

    HotPlug(obj) {
        setTimeout(()=>{
            for(var i = 0; i < _this.SupportDevice.length; i++) {
                if(obj.status == 1) {
                    if(parseInt(_this.SupportDevice[i].vid) == obj.vid && parseInt(_this.SupportDevice[i].pid) == obj.pid) {
                        var self = this;
                        var result = _this.hid.FindDevice(_this.SupportDevice[i].set.usagepage, _this.SupportDevice[i].set.usage,_this.SupportDevice[i].vid, _this.SupportDevice[i].pid)
                        if(_this.SupportDevice[i].vid.toLowerCase() == '0x195d'|| _this.SupportDevice[i].pid.toLowerCase() == '0xa005')
                            result = 1;
                        if(result != 0) {
                            //--------------DeviceCallback----------------
                            if(_this.SupportDevice[i].vid.toLowerCase() == '0x195d'|| _this.SupportDevice[i].pid.toLowerCase() == '0xa005') {
                                var rtn = _this.hid.DeviceDataCallback(_this.SupportDevice[i].get.usagepage, _this.SupportDevice[i].get.usage,_this.SupportDevice[i].vid, _this.SupportDevice[i].pid,_this.HIDReadDataFromDevice);
                                env.log('HotPlug', 'DeviceDataCallback : ', rtn);
                            }
                            //--------------DeviceCallback----------------
                            var sn = _this.SupportDevice[i].vid+_this.SupportDevice[i].pid
                            var dev = {};
                            dev.BaseInfo = _this.SupportDevice[i];
                            dev.BaseInfo.DeviceId = result;
                            dev.BaseInfo.SN = sn;
                            if(_this.AllDevices.has(sn))
                                return;
                            _this.AllDevices.set(sn, dev);

                            _this.GetDeviceInst(dev).then(()=>{
                                _this.SavePluginDevice();
                            });
                        }
                    }
                } else {
                    if(parseInt(_this.SupportDevice[i].vid) == obj.vid && parseInt(_this.SupportDevice[i].pid) == obj.pid) {
                        var sn = _this.SupportDevice[i].vid+_this.SupportDevice[i].pid;
                        var result = _this.hid.FindDevice(_this.SupportDevice[i].set.usagepage, _this.SupportDevice[i].set.usage,_this.SupportDevice[i].vid, _this.SupportDevice[i].pid)
                        if(_this.SupportDevice[i].vid.toLowerCase() == '0x195d'|| _this.SupportDevice[i].pid.toLowerCase() == '0xa005')
                            result = 1;
                        if(result == 0) {
                            _this.AllDevices.delete(sn);
                            _this.SavePluginDevice();
                        }
                    }
                }
            }
        },1500)
    }

    //原OnSpecrumMessage
    OnApmodeMessage(obj) {
        if(obj.Func == evtType.SendSyncLED) {
            for(var val of _this.AllDevices.values()) {
                if(val.BaseInfo.SN == '0x195D0xA005') {
                    var Data = obj.Param.Data[0]
                    _this[val.BaseInfo.routerID].setApMode(val, Data);
                }
            }
            _this.emit(evtType.ProtocolMessage, obj);
        }
    }

    /**
     * Change keyboard Profile
     * @param flag 1:Profile 2:Layer
     * @param updown 1:Up 2:Down
     */
    async ChangeKeyboardProfileLayer(flag, updown) {
        global.ChangeProfileLayerFlag = true;
        let i = 0;
        let length = _this.MapArraylength(_this.AllDevices)
        for(var val of _this.AllDevices.values()) {
            var dev = _this.AllDevices.get(val.BaseInfo.SN);
            if(val.BaseInfo.ModelType == 2 && flag == 1) 
               await dev.SeriesInstance["ChangeProfile"](dev, updown);
            else if(val.BaseInfo.ModelType == 2 && flag == 2) 
               await dev.SeriesInstance["ChangeLayer"](dev, updown);
            i++;
            if(i >= length)
                global.ChangeProfileLayerFlag = false;
        }
    }

    //Count Map Array length
    MapArraylength(x) {
        var len = 0;
        for(var count of x)
            len++
        return len;
    }
}

module.exports = DeviceService;