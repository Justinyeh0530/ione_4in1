const EventEmitter = require('events');
var SpecEffects = require('./SpecEffects');//SpecEffects
const env = require('../../others/env');
const funcVar = require('../../others/FunctionVariable');
const { isObjectLike } = require('lodash');
const evtType = require('../../others/EventVariable').EventTypes;


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
        // _this.AppDB = AppObj.getInstance();
        _this.initService();
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
                Param: { Func: evtType.SendSyncLED, iSyncDevice: 99, Data: Data ,SendtoUI:_this.SendtoUI}
            };
            console.log(555555, Obj)
            _this.emit(evtType.ProtocolMessage, Obj);
        });
    }

    //原SpecEffectTimer
    StartApmode(callback) {
        _this.SendtoUI = false;
        //-------------SpecEffects---------------------
        if (_this.SpecEffects == undefined) {
            _this.SpecEffects =  SpecEffects.getInstance();
            _this.SpecEffects.RefreshDevices();
            _this.ReadApModeDBAndSet();
        }
        else
            _this.SpecEffects.SwitchTimer(true);
        //-------------SpecEffects---------------------
        clearInterval(_this.m_iTimerAllLED);
        _this.m_iTimerAllLED = setInterval(_this.OnTimerAllLED, 40);
        callback();
    }

    ReadApModeDBAndSet() {
        _this.AppDB.getApMode().then(function (data) {
            if (data[0] != undefined) {
                var EffectLibrary = [];
                for (let index = 0; index < data[0].layerlist.length; index++) {
                    EffectLibrary.push(data[0].layerlist[index]);
                }
                let SyncLEDData = {
                    EffectLibrary: EffectLibrary,
                    DeviceAxis: data[0].Device
                }
                _this.SetSyncLEDData(SyncLEDData,function (){});
            }
        });
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
        var m_iEffectName = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
            tmpEffectLibrary.Opacity = SynceData.EffectLibrary[i].Opcaity;
        }
        if (_this.SpecEffects != undefined){
            _this.SpecEffects.SetSyncLEDData(Obj2).then(function () {
                callback("SetSyncLEDData Done");
            });
        }
    }
}

module.exports = ApmodeService;