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
            _this.dtsController.VolumeInitialization();
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

    HIDReadData(dev, objData) {
        console.log('HIDReadData begin data :',objData);
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
        _this.SetVolumChannel(0, obj.VolumeFL);
        _this.SetVolumChannel(1, obj.VolumeFR);
        _this.SetVolumChannel(2, obj.VolumeC);
        _this.SetVolumChannel(3, obj.VolumeLFE);
        _this.SetVolumChannel(4, obj.VolumeSL);
        _this.SetVolumChannel(5, obj.VolumeSR);
        _this.SetVolumChannel(6, obj.VolumeL);
        _this.SetVolumChannel(7, obj.VolumeR);
        callback();
    }

    setMicrophone(dev, obj, callback) {
        _this.SetMicrophoneVolume(obj.MicVolumeValueTemp);
        callback();
    }

    /**
     * 
     * @param {*} obj 
     * @param {*} callback 
     * channel => 0:左前, 1: 右前, 2:中前, 3:重低, 4:左後, 5:右後, 6:左側, 7:右側
     * volume => 音量大小 (0-100)
     *          
    */
    SetVolumChannel(channel, volume) {
        _this.dtsController.SetVolumChannel(channel, volume * 10)
    }

    /**
     * 
     * @param {*} obj 
     * @param {*} callback 
     *
     * volume => 麥克風大小 (0-100)
     *          
    */
    SetMicrophoneVolume(volume) {
        _this.dtsController.SetMicrophoneVolume(volume);
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

    setApMode(dev, obj) {
        // var color = [[255,0,0], [0,255,0], [255,0,0], [0,255,0],
        // [255,0,0], [0,255,0], [255,0,0], [0,255,0],
        // [255,0,0], [0,255,0], [255,0,0], [0,255,0],[255,0,0], [0,255,0], [255,0,0], [0,255,0]];
        // var color1 = [[0,255,0], [0,255,0], [0,255,0], [0,255,0],
        // [0,255,0], [0,255,0], [0,255,0], [0,255,0],
        // [0,255,0], [0,255,0], [0,255,0], [0,255,0],
        // [0,255,0], [0,255,0], [0,255,0], [0,255,0]];
        // let param = {ledNum : 16,
        //              colorArray : color};
        // let param1 = {ledNum : 16,
        //             colorArray : color1};
        // for(var i = 0; i < 100; i++)
        //     _this.setLEDPatten(dev, param1);


        // for(var i = 0; i < 100; i++)
        //     _this.setLEDPatten(dev, param);

        // for(var i = 0; i < 100; i++)
        //     _this.setLEDPatten(dev, param1);
        let param = {ledNum : 16, colorArray : obj};
        _this.setLEDPatten(dev, param);
    }

    /**
     * 
     * @param {*} dev 
     * @param {*} obj 
     * 
     * obj.LedNum : LED 數量，最大16組
     * obj.colorArray : LED 顏色陣列，依照LED數量
     * 
     */
    setLEDPatten(dev, obj) {
        // env.log('headset','setLEDPatten', obj);
        var data = Buffer.alloc(16);
        data[0] = 0xFF;
        var num = Math.ceil(obj.ledNum/4);

        // console.log('777 num',num)
        var i, j;
        for(i = 0; i < num; i++) {
            data[1] = 0x03;
            for(var x = 4; x < 16; x++){
                data[x] = 0;
            }
            for(j = 0; j < 4; j++) {
                if(obj.colorArray[(4*i)+(j)][0] != null) {
                    data[4+(3*j)] = obj.colorArray[(4*i)+(j)][0];
                    data[4+(3*j)+1] = obj.colorArray[(4*i)+(j)][1];
                    data[4+(3*j)+2] = obj.colorArray[(4*i)+(j)][2];
                }
                else{
                    break;
                }
            }
            data[2] = j;
            data[3] = 4*i;

            // console.log('555555555 data', data);
            _this.hid.SetHidWrite(dev.BaseInfo.DeviceId, 0xff, 16, data); 
        }

        for(var x = 1; x < 16; x++){
            data[x] = 0;
        }

        data[1] = 0x02
        data[2] = 0x00;
        data[3] = 0x02;
        data[4] = 0x32;
        data[5] = 0x32;

        // console.log('555555555 data', data);
        _this.hid.SetHidWrite(dev.BaseInfo.DeviceId, 0xff, 16, data);
    }

    /**
     * 
     * @param {*} obj 
     * 
     * Bright: 亮度,
     * Speed: 呼吸燈速度,
        ColorMode: LED模式,
        SetColorMode: SetColorMode,
        RadarDuration: Duration,
        Color1: color1,
        Color2: color2,
        ColorArray: colorArray
     */
    setLightToDevice(dev, obj) {
        try {
            if(obj.SetColorMode == 4){
                var data = Buffer.alloc(16);
                console.log('333333333', obj.ColorArray.length, obj.ColorArray);

                var length = obj.ColorArray.length;
                var flag = 0;
                //wave mode

                for(var i = 0; i < 4; i++) {
                    for(var x = 0; x < 16; x++)
                        data[x] = 0;

                    data[0] = 0xFF;
                    data[1] = 0x03;
                    data[2] = 0x04;
                    data[3] = i*4;
                    data[4] = obj.ColorArray[i*4][0];
                    data[5] = obj.ColorArray[i*4][1];
                    data[6] = obj.ColorArray[i*4][2];
                    data[7] = obj.ColorArray[i*4+1][0];
                    data[8] = obj.ColorArray[i*4+1][1];
                    data[9] = obj.ColorArray[i*4+1][2];
                    data[10] = obj.ColorArray[i*4+2][0];
                    data[11] = obj.ColorArray[i*4+2][1];
                    data[12] = obj.ColorArray[i*4+2][2];
                    data[13] = obj.ColorArray[i*4+3][0];
                    data[14] = obj.ColorArray[i*4+3][1];
                    data[15] = obj.ColorArray[i*4+3][2];

                    console.log('set wave data to device : ', data);
                    _this.hid.SetHidWrite(dev.BaseInfo.DeviceId, 0xff, 16, data);                   
                }

                for(var x = 0; x < 16; x++) 
                    data[x] = 0;

                data[0] = 0xFF;
                data[1] = 0x02;
                data[2] = 0x00;
                data[3] = 0x02;
                data[4] = 0x32;
                data[5] = 0x32;
                data[6] = 0xFF;

                console.log('set wave 1 data to device : ', data);
                _this.hid.SetHidWrite(dev.BaseInfo.DeviceId, 0xff, 16, data);


                for(var x = 0; x < 16; x++) 
                    data[x] = 0;

                data[0] = 0xFF;
                data[1] = 0x02;
                data[2] = obj.SetColorMode;
                data[3] = obj.ColorMode;
                data[4] = obj.Speed;
                data[5] = obj.Bright;

                console.log('set wave 1 data to device : ', data);
                _this.hid.SetHidWrite(dev.BaseInfo.DeviceId, 0xff, 16, data);
            }
            else { 
                console.log('obj :', obj);
                var data = Buffer.alloc(16);
                data[0] = 0xFF;
                data[1] = 0x02;
                data[2] = obj.SetColorMode;
                data[3] = obj.ColorMode;
                data[4] = obj.Speed;
                data[5] = obj.Bright;
                data[6] = obj.Color1[0];
                data[7] = obj.Color1[1];
                data[8] = obj.Color1[2];
                data[9] = obj.Color2[0];
                data[10] = obj.Color2[1];
                data[11] = obj.Color2[2];
                data[12] = 0x00;
                data[13] = 0x00;
                data[14] = 0x00;
                data[15] = 0x00;


                console.log('set led data to device : ', data);
                _this.hid.SetHidWrite(dev.BaseInfo.DeviceId, 0xff, 16, data)
            }
        }catch(e) {
            env.log('ERROR','setLighting', `${e}`);
        }
    }


    setLighting(dev, obj) {
        try {
            env.log('headset','setLighting', 'begin...');
            var _this = this, ColorMode, color1, color2, SetColorMode, Duration = 0, colorArray = [];
            switch(obj.lightingvalue) {
                //static
                case 0:
                    if(obj.SpectrumValue)
                        ColorMode = 1; //spectrum
                    else
                        ColorMode = 0; //single
                    SetColorMode = 0;
                  
                    break;

                //breath;
                case 1:
                    if(obj.SpectrumValue)
                        ColorMode = 1; //spectrum
                    else
                        ColorMode = 2; //Alternation
                    SetColorMode = 1;
                    break;

                
                //flash;
                case 6:
                    if(obj.SpectrumValue)
                        ColorMode = 1; //spectrum
                    else
                        ColorMode = 2; //Alternation
                    SetColorMode = 2;
                    break;
                //wave
                case 3: 
                {
                    // if(obj.SpectrumValue)
                    //     ColorMode = 0; //spectrum
                    // else
                    //     ColorMode = 1; //Alternation
                    ColorMode = 1;
                    SetColorMode = 4;
                    
                    // for(var i = 0; i < obj.ColorSectionArray.length; i++) {
                    //     colorArray.push(obj.ColorSectionArray[i].color[0]);
                    //     colorArray.push(obj.ColorSectionArray[i].color[1]);
                    //     colorArray.push(obj.ColorSectionArray[i].color[2]);
                    // }

                    if(obj.ColorSectionArray.length == 2){
                        for(var i = 0; i < 8; i++) {
                            colorArray.push(obj.ColorSectionArray[0].color);
                        }
                        for(var i = 0; i < 8; i++) {
                            colorArray.push(obj.ColorSectionArray[1].color);
                        }
                    }else if(obj.ColorSectionArray.length == 3){
                        for(var i = 0; i < 5; i++) {
                            colorArray.push(obj.ColorSectionArray[0].color);
                        }
                        for(var i = 0; i < 5; i++) {
                            colorArray.push(obj.ColorSectionArray[1].color);
                        }
                        for(var i = 0; i < 6; i++) {
                            colorArray.push(obj.ColorSectionArray[1].color);
                        }
                    }
                    else if(obj.ColorSectionArray.length == 4){
                        for(var i = 0; i < 4; i++) {
                            for(var j = 0; j < 4; j++)
                                colorArray.push(obj.ColorSectionArray[i].color);
                        }
                    }
                    else if(obj.ColorSectionArray.length == 5){
                        for(var i = 0; i < 5; i++) {
                            for(var j = 0; j < 3; j++)
                                colorArray.push(obj.ColorSectionArray[i].color);
                        }
                        colorArray.push(obj.ColorSectionArray[4].color);
                    }
                    else if(obj.ColorSectionArray.length == 6){
                        for(var i = 0; i < 6; i++) {
                            for(var j = 0; j < 2; j++)
                                colorArray.push(obj.ColorSectionArray[i].color);
                        }
                        colorArray.push(obj.ColorSectionArray[5].color);
                        colorArray.push(obj.ColorSectionArray[5].color);
                        colorArray.push(obj.ColorSectionArray[5].color);
                        colorArray.push(obj.ColorSectionArray[5].color);
                    }
                    else if(obj.ColorSectionArray.length == 7){
                        for(var i = 0; i < 7; i++) {
                            for(var j = 0; j < 2; j++)
                                colorArray.push(obj.ColorSectionArray[i].color);
                        }
                        colorArray.push(obj.ColorSectionArray[7].color);
                        colorArray.push(obj.ColorSectionArray[7].color);
                    }
                    else if(obj.ColorSectionArray.length == 8){
                        for(var i = 0; i < 8; i++) {
                            for(var j = 0; j < 2; j++)
                                colorArray.push(obj.ColorSectionArray[i].color);
                        }
                    }
                    else {
                        for(var i = 0; i < obj.ColorSectionArray.length; i++) {
                            colorArray.push(obj.ColorSectionArray[i].color);
                        }

                        if(obj.ColorSectionArray.length < 16){
                            for(var i = obj.ColorSectionArray.length; i < 16; i++) {
                                colorArray.push(obj.ColorSectionArray[obj.ColorSectionArray.length-1].color);
                            }
                        }
                    }
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
                    SetColorMode = 3;
                    break;    

                }
              
                //color shift
                case 4:
                    ColorMode = 0;
                    SetColorMode = 5;

                    break;
                    
                //radar
                case 2:
                {
                    if(obj.SpectrumValue)
                        ColorMode = 1; //spectrum
                    else
                        ColorMode = 2; //Alternation
                    SetColorMode = 6;

                    Duration = obj.DurationValue-1;
                    if(obj.DurationValue == 1)
                        SetColorMode = 6;
                    else if(obj.DurationValue == 2)
                        SetColorMode = 0x16;
                    else 
                        SetColorMode = 0x26;
                    break;         
                }           
                //LED off;
                case 7:
                    ColorMode = 0;
                    SetColorMode = 7;
                break;

            }
            color1 = obj.color[0];
            if(obj.color.length > 1)
                color2 = obj.color[1];
            else
                color2 = color1;

            let param = {
                Bright: obj.BrightnessValue*10,
                Speed: Math.abs(100 - obj.SpeedValue*10),
                ColorMode: ColorMode,
                SetColorMode: SetColorMode,
                RadarDuration: Duration,
                Color1: color1,
                Color2: color2,
                ColorArray: colorArray
            }

            _this.setLightToDevice(dev, param);
           
        } catch(e) {
            logger.error(loggertitle,'setLighting', `${e}`)
        }
    }
}

module.exports = Headset;