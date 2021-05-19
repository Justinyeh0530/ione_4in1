const env = require('../../../others/env');
const logger  = require('../../../others/logger')
const loggertitle = "headset"
var Device = require('../Device')
var nedbObj = require('../../../dbapi/AppDB');
const { isObjectLike } = require('lodash');
var evtType = require('../../../others/EventVariable').EventTypes;
// var edge = require('electron-edge-js');

'use strict';
var _this;

class Headset extends Device {
    constructor() {
        env.log('Headset','Headsetclass','begin');
        super();
        _this = this;
        _this.nedbObj = nedbObj.getInstance();
        _this.test = 0;
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

        if (env.isWindows){
            if (env.arch == 'ia32'){
                _this.dtsController = require(`../../nodeDriver/x32/DTSLibrary.node`);
            }else{
                _this.dtsController = require(`../../nodeDriver/x64/DTSLibrary.node`);
            }

            env.log('Headset','initDevice','dtsController Initialization');
            _this.dtsController.Initialization();
            _this.dtsController.DTSApoGetSupportMode();
            
        }


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

    setDashboard(dev, obj, callback) {
        _this.setModeValue(obj)
        if(obj.VirtualizationValue)
            _this.setRoom(obj)
        callback();
    }

    setEqulizer(dev, obj, callback) {
        _this.setDTSMode(obj, function(data) {
            if(data == 1) {
                _this.setEQValue(obj,function(){ callback() });
            } else
                callback();
        });
    }

    setSurroundSound(dev, obj, callback) {
        _this.setRoom(obj);
        _this.setStereoPreference(obj);
        callback();
    }

    setMicrophone(dev, obj, callback) {
        _this.SetMicrophoneVolume(obj)
    }

    /**
     * 
     * @param {*} obj 
     * @param {*} callback 
     */
    SetMicrophoneVolume(obj, callback) {
        this.dtsController.SetMicrophoneVolume(volume)
    }

    /**
     * 
     * @param {*} obj 
     * @param {*} callback 
     */
    setDTSMode(obj,callback) {
        var str =   [   "ApoOpMode:APO4-Off/APO4-Headphone",
                        "ApoOpMode:APO4-Music/APO4-Headphone",
                        "ApoOpMode:APO4-Movie/APO4-Headphone",
                        "ApoOpMode:APO4-Voice/APO4-Headphone",
                        "ApoOpMode:APO4-Game1/APO4-Headphone",
                        "ApoOpMode:APO4-Game2/APO4-Headphone",
                        "ApoOpMode:APO4-Game3/APO4-Headphone",
                        "ApoOpMode:APO4-Custom Audio/APO4-Headphone"
                    ];
        let result = str[0];
        switch(obj.mode) {
            case 0: //Music
                result = str[1];
                break;
            case 1: //Movie
                result = str[2];
                break;
            case 2: //Voice
                result = str[3];
                break;
            case 3: //GAME(FPS)
                result = str[4];
                break;
            case 4: //GAME(MOBA)
                result = str[5];
                break;
            case 5: //GAME(MMO)
                result = str[6];
                break;
            case 6: //CUSTOM
                result = str[7];
                break;
            case 8: //OFF
                result = str[0];
                break;
        }
        let flag = _this.dtsController.DTSApoSetMode(result);
        callback(flag);
    }

    /**
     * setModeValue
     * @param {*} obj 
     */
    setModeValue(obj) {
        // var value = 1; //0 : disable or 1 : enable
        var str = ["SFX:Eagle-I3DA Enable", //Virtualization
                    "SFX:Eagle-LC Enable",  //Loudness Control
                    "SFX:Eagle-DE Enable",  //Dialog Enhancement
                    "MFX:Eagle-TBHDX Enable", //Bass (TBHDX)
                    "MFX:Eagle-AEQ Enable" //Headphone EQ
                  ]
        _this.dtsController.DTSApoSetModeValue(str[0], obj.VirtualizationValue);
        _this.dtsController.DTSApoSetModeValue(str[1], obj.LoudnessValue);
        _this.dtsController.DTSApoSetModeValue(str[2], obj.DialogEnhancementValue);
        _this.dtsController.DTSApoSetModeValue(str[3], obj.BassValue);
        _this.dtsController.DTSApoSetModeValue(str[4], obj.HeadphoneEQValue);
    }

    /**
     * setModeValue
     * @param {*} dev 
     * @param {*} obj 
     * 
     * obj.value
     * Eagle-I3DA Room Entertainment = 0 for Entertainment
     * Eagle- I3DA Room Game = 1 for Game
     * Eagle- I3DA Room Sports = 2 for Sports 

     */
    setRoom(obj) {
        _this.dtsController.DTSApoSetModeValue("SFX:Eagle-I3DA Room Index", obj.EnvironmentValue);
    }

    /**
     * 
     * @param {*} dev 
     * @param {*} obj 
     * 
     * obj.vaule
     * Eagle-Stereo Mode = 1 for Front
     * Eagle-Stereo Mode = 2 for Wide.
     * Eagle-Stereo Mode = 3 for Traditional
     */
    setStereoPreference(obj) {
        _this.dtsController.DTSApoSetModeValue("Eagle-Stereo Mode", obj.StereoValue);
    }

    /**
     * 
     * @param {*} dev 
     * @param {*} obj 
     * 
     * Value = 0, EQ off
     * Value = 1, EQ on
     */
    setEQOnOff(value) {
        _this.dtsController.DTSApoSetEQOnOff(value);
    }

    /**
     * 
     * @param {*} dev 
     * @param {*} obj 
     * 
     * obj.num = EQ Band Number
     * obj.value = EQ Band Number Value
     */
    setEQValue(obj) {
        _this.setEQOnOff(1);
        _this.dtsController.DTSApoSetEQBandValue(0,obj.value31)
        _this.dtsController.DTSApoSetEQBandValue(1,obj.value62)
        _this.dtsController.DTSApoSetEQBandValue(2,obj.value125)
        _this.dtsController.DTSApoSetEQBandValue(3,obj.value250)
        _this.dtsController.DTSApoSetEQBandValue(4,obj.value500)
        _this.dtsController.DTSApoSetEQBandValue(5,obj.value1K)
        _this.dtsController.DTSApoSetEQBandValue(6,obj.value2K)
        _this.dtsController.DTSApoSetEQBandValue(7,obj.value4K)
        _this.dtsController.DTSApoSetEQBandValue(8,obj.value8K)
        _this.dtsController.DTSApoSetEQBandValue(9,obj.value16K)
    }


    

    setLighting(dev, obj) {
        try {
            env.log('headset','setLighting', 'begin...');
            console.log(111111111111111111111,obj, obj.color.length);
            var _this = this, ColorMode, color1, color2, SetColorMode, Duration = 0, colorArray = [];
            switch(obj.lightingvalue) {
                //static
                case 0:
                    if(obj.SpectrumValue)
                        ColorMode = 1; //spectrum
                    else
                        ColorMode = 0; //single
                    SetColorMode = 1;
                    break;

                //breath;
                case 1:
                    if(obj.SpectrumValue)
                        ColorMode = 1; //spectrum
                    else
                        ColorMode = 2; //Alternation
                    SetColorMode = 2;
                    break;

                
                //flash;
                case 6:
                    if(obj.SpectrumValue)
                        ColorMode = 1; //spectrum
                    else
                        ColorMode = 2; //Alternation
                    SetColorMode = 3;
                    break;
                //wave
                case 3: 
                {
                    // if(obj.SpectrumValue)
                    //     ColorMode = 0; //spectrum
                    // else
                    //     ColorMode = 1; //Alternation
                    ColorMode = 1;
                    SetColorMode = 5;
                    
                    for(var i = 0; i < obj.ColorSectionArray.length; i++) {
                        colorArray.push(obj.ColorSectionArray[i].color[0]);
                        colorArray.push(obj.ColorSectionArray[i].color[1]);
                        colorArray.push(obj.ColorSectionArray[i].color[2]);
                    }
                    env.log('111', '3', JSON.stringify(colorArray));
                    break;
                }
                //spiral rainbow
                case 5: 
                {
                    if(obj.SpectrumValue)
                        ColorMode = 1; //spectrum
                    else
                        ColorMode = 3; //Alternation

                    ColorMode = ColorMode + obj.DirectionValue;
                    SetColorMode = 4;
                    break;    

                }
              
                //color shift
                case 4:
                    ColorMode = 0;
                    SetColorMode = 6;

                    break;
                    
                //radar
                case 2:
                {
                    if(obj.SpectrumValue)
                        ColorMode = 1; //spectrum
                    else
                        ColorMode = 2; //Alternation
                    SetColorMode = 7;

                    Duration = obj.DurationValue-1;
                    break;         
                }           
                //LED off;
                case 7:
                    ColorMode = 0;
                    SetColorMode = 8;
                break;

            }
            color1 = obj.color[0];
            if(obj.color.length > 1)
                color2 = obj.color[1];
            else
                color2 = color1;
            let param = {
                Bright: obj.BrightnessValue*10,
                Speed: obj.SpeedValue*10,
                ColorMode: ColorMode,
                SetColorMode: SetColorMode,
                RadarDuration: Duration,
                Color1: color1,
                Color2: color2,
                ColorArray: colorArray
            }
            // console.log(2222222,param)
            // env.log('2222222','1',param)
            
        } catch(e) {
            logger.error(loggertitle,'setLighting', `${e}`)
        }
    }
}

module.exports = Headset;