const EventEmitter = require('events');
var SpecEffects = require('./SpecEffects');//SpecEffects
const env = require('../../others/env');
const funcVar = require('../../others/FunctionVariable');
const { isObjectLike } = require('lodash');
const evtType = require('../../others/EventVariable').EventTypes;
var AppObj = require('../../dbapi/AppDB');


'use strict';
var _this;
class ApmodeService extends EventEmitter {

    constructor() {
        env.log('SpecService', 'SpecService class', 'begin');
        super();
        _this = this;
        _this.m_iTimerAllLED;//Timer For Function
        _this.m_iTimerDeviceLED = {};//Timer For Function
        _this.SendtoUI = false;//Timer For Function
        _this.AppDB = AppObj.getInstance();
        // _this.initService();
    }


    static getInstance() {
        if (this.instance) {
            env.log('ApmodeService', 'getInstance', `Get exist ApmodeService() INSTANCE`);
            return this.instance;
        }
        else {
            env.log('ApmodeService', 'getInstance', `New ApmodeService() INSTANCE`);
            this.instance = new ApmodeService();

            return this.instance;
        }
    }

    initService() {
        env.log('ApmodeService', 'initService', 'initService')
        return new Promise(function (resolve) {
            try {
                if (_this.SpecEffects == undefined)
                    _this.SpecEffects =  SpecEffects.getInstance();
                resolve();
            } catch (e) {
                env.log('ApmodeService', 'initService', `Error:${e}`);
                resolve();
            }
        });
    }

    OnTimerAllLED() {
        _this.SpecEffects.GetRenderColors().then(function (Data) {
            //-----------emit-------------------
            var Obj = {
                Type: funcVar.FuncType.Device,
                Func: evtType.SendSyncLED, 
                Param: { Func: evtType.SendSyncLED, iSyncDevice: 99, Data: Data ,SendtoUI:_this.SendtoUI}
            };
            // if(Obj.Param.Data.length > 0)
                // console.log(555555, Obj.Param.Data)
            _this.emit(evtType.ProtocolMessage, Obj);
        });
    }

    //原SpecEffectTimer
    StartApmode(obj, callback) {
        try {
            _this.SendtoUI = false;
            //-------------SpecEffects---------------------
            if (_this.SpecEffects == undefined) {
                _this.SpecEffects =  SpecEffects.getInstance();
            }
            else
                _this.SpecEffects.SwitchTimer(true);
            _this.SpecEffects.RefreshDevices();
            _this.ReadApModeDBAndSet(obj);
            //-------------SpecEffects---------------------
            clearInterval(_this.m_iTimerAllLED);
            _this.m_iTimerAllLED = setInterval(_this.OnTimerAllLED, 40);
            callback();
        } catch(e) {
            console.error('StartApmode', e)
            env.log('Apmode','StartApmode',e)
        }
    }

    StopApMode(obj, callback) {
        clearInterval(_this.m_iTimerAllLED);
        clearInterval(_this.m_iTimerDeviceLED);
        if(_this.SpecEffects != undefined)
            _this.SpecEffects.SwitchTimer(false);
    }

    ReadApModeDBAndSet(obj) {
        try {
            if(obj == 1)
                _this.AppDB.getApMode().then(function (data) {
                    if (data != undefined) {
                        var EffectLibrary = [];
                        for (let index = 0; index < data.layerlist.length; index++) {
                            EffectLibrary.push(data.layerlist[index]);
                        }
                        let SyncLEDData = {
                            EffectLibrary: EffectLibrary,
                            DeviceAxis: data.Device
                        }
                        _this.SetSyncLEDData(SyncLEDData,function (){});
                    }
                });
            else {
                var data = obj;
                if (data != undefined) {
                    var EffectLibrary = [];
                    for (let index = 0; index < data.layerlist.length; index++) {
                        EffectLibrary.push(data.layerlist[index]);
                    }
                    let SyncLEDData = {
                        EffectLibrary: EffectLibrary,
                        DeviceAxis: data.Device
                    }
                    _this.SetSyncLEDData(SyncLEDData,function (){});
                }
            }
        } catch(e) {
            console.log('ReadApModeDBAndSet',e)
            env.log('Apmode','ReadApModeDBAndSet',e)
        }
    }

    SetSyncLEDData(obj, callback) {
        /**
         * 演算法
         * 0: Wave
         * 1: ConicBand
         * 2: Spiral
         * 3: Cycle
         * 4: LinearWave
         * 5: Ripple
         * 6: Breathing
         * 7: Rain
         * 8: Fire
         * 9: Trigger
         * 10: AudioCap
         * 11: static
         * 
         * 
         * UI
         * 0: Static
         * 1: Wave
         * 2: ConicBand
         * 3: Sprial
         * 4: Cycle
         * 5: LinearWave
         * 6: Ripple
         * 7: Breathing
         * 8: Rain
         * 9: Fire
         * 10: Reactive
         * 11: AudioCap
         */
        try {
            var m_iEffectName = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            var SyncDevices = ['0x195D0xA005']
            var EffectLibrary = [];
            var SynceData = obj;
            var GradientArray = [];
            for(let i = 0; i < SynceData.EffectLibrary.length; i++) {
                var tmpEffectLibrary = {};
                //顏色數量
                var Color_Num = SynceData.EffectLibrary[i].ColorSectionArray.length;
                //燈效的值
                tmpEffectLibrary.Effect = m_iEffectName[SynceData.EffectLibrary[i].value];
                //取每個Layer的顏色
                for (var j = 0; j < Color_Num; j++) {
                    let color = {
                        R: SynceData.EffectLibrary[i].ColorSectionArray[j].color[0],
                        G: SynceData.EffectLibrary[i].ColorSectionArray[j].color[1],
                        B: SynceData.EffectLibrary[i].ColorSectionArray[j].color[2],
                    }
                    var Gradient = {
                        color: color,
                        percent: parseInt(100 / (Color_Num - 1) * j)
                    };
                    GradientArray.push(Gradient);
                }
                tmpEffectLibrary.GradientArray = GradientArray;
                tmpEffectLibrary.Opacity = SynceData.EffectLibrary[i].opacityvalue / 100;
                tmpEffectLibrary.input_visible = SynceData.EffectLibrary[i].enable;
                tmpEffectLibrary.BandWidth = SynceData.EffectLibrary[i].bandwidthvalue;
                if(tmpEffectLibrary.Effect == 6) //breath
                    tmpEffectLibrary.BandWidth = 200;
                tmpEffectLibrary.Angle = SynceData.EffectLibrary[i].anglevalue;
                tmpEffectLibrary.Speed = (SynceData.EffectLibrary[i].speedvalue + 5) / 10,
                tmpEffectLibrary.Bidirectional = SynceData.EffectLibrary[i].bidirectionalvalue;
                tmpEffectLibrary.Bump = SynceData.EffectLibrary[i].bumpvalue;
                tmpEffectLibrary.Direction = SynceData.EffectLibrary[i].directionvalue;
                tmpEffectLibrary.Fire = SynceData.EffectLibrary[i].firevalue / 10;
                tmpEffectLibrary.Gradient = SynceData.EffectLibrary[i].gradientvalue;
                tmpEffectLibrary.Number = SynceData.EffectLibrary[i].numbervalue;
                tmpEffectLibrary.Separate = SynceData.EffectLibrary[i].separatevalue
                tmpEffectLibrary.Amplitude = SynceData.EffectLibrary[i].amplitudevalue
                tmpEffectLibrary.Soft = SynceData.EffectLibrary[i].fadvalue;
                //center
                tmpEffectLibrary.canvasCenterX = parseInt(SynceData.EffectLibrary[i].center.x);
                tmpEffectLibrary.canvasCenterY = parseInt(SynceData.EffectLibrary[i].center.y);
                // No use
                tmpEffectLibrary.Radius = 50;
                tmpEffectLibrary.Gap = 2;
                tmpEffectLibrary.Taketimes = 3;

                //Device被選中的框框
                var arrDeviceSelect = [];
                for (let index = 0; index < SyncDevices.length; index++) {
                    for (let indexSN = 0; indexSN < SynceData.DeviceAxis.length; indexSN++) {
                        if (SynceData.DeviceAxis[indexSN].SN == SyncDevices[index]) {
                            arrDeviceSelect.push(SynceData.DeviceAxis[indexSN].led);
                            break;
                        }
                    }
                }
                tmpEffectLibrary.deviceselects = arrDeviceSelect;
                EffectLibrary.push(tmpEffectLibrary);
            }
            //Device座標
            var arrDeviceAxis = [];
            for (let index = 0; index < SyncDevices.length; index++) {
                for (let indexSN = 0; indexSN < SynceData.DeviceAxis.length; indexSN++) {
                    if (SynceData.DeviceAxis[indexSN].SN == SyncDevices[index]) {
                        var tmpDeviceAxis = {X:SynceData.DeviceAxis[indexSN].x , Y:SynceData.DeviceAxis[indexSN].y}
                        if (tmpDeviceAxis.X == undefined) {
                            tmpDeviceAxis = {X: 0, Y: 0};
                        }
                        arrDeviceAxis.push(tmpDeviceAxis);
                        break;
                    }
                }
            }
            var DeviceAxis = arrDeviceAxis;

            var Obj2 = {
                EffectLibrary: EffectLibrary,
                DeviceAxis: DeviceAxis
            }
            if (_this.SpecEffects != undefined){
                _this.SpecEffects.SetSyncLEDData(Obj2).then(function () {
                    callback("SetSyncLEDData Done");
                });
            }
        } catch(e) {
            console.log('SetSyncLEDData',e)
            env.log('Apmode','SetSyncLEDData',e)
        }
    }
}

module.exports = ApmodeService;