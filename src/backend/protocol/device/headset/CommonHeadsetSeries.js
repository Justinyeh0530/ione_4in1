const env = require('../../../others/env');
var headset = require('./headset');
var path = require('path');
var evtType = require('../../../others/EventVariable').EventTypes;
var nedbObj = require('../../../dbapi/AppDB');
var ApmodeService = require('../../apmode/ApmodeService')

'use strict';
var _this;

class CommonHeadsetSeries extends headset {
    constructor(hid, DeviceService) {
        env.log('CommonHeadsetSeries','CommonHeadsetSeries class','begin');
        super();
        _this = this;
        _this.hid = hid;
        _this.DeviceService = DeviceService;
        _this.nedbObj = nedbObj.getInstance();
        _this.ApmodeService = ApmodeService.getInstance();
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
        env.log('CommonHeadsetSeries','InitialDevice','InitialDevice');
        dev.m_bSetSyncEffect = false;
        dev.m_bSetHWDevice = false;//SET Device
        dev.m_bLaunchprogram = false;

        if (env.isWindows){
            if (env.arch == 'ia32'){
                _this.dtsController = require(`../../nodeDriver/x32/DTSLibrary.node`);
            }else{
                _this.dtsController = require(`../../nodeDriver/x64/DTSLibrary.node`);
            }

            env.log('CommonHeadsetSeries','initDevice','dtsController Initialization');
            var rtn = _this.dtsController.Initialization();
            var rtn = _this.dtsController.DTSApoGetSupportMode();
            _this.dtsController.VolumeInitialization();
        }

        _this.AppConnectDevice(dev, 1);
        _this.initDTS(dev);
        _this.initLED(dev);
        _this.initMicrophone(dev);
    
        callback();
    }

    AppConnectDevice(dev, flag) {
        var data = Buffer.alloc(16);
        data[0] = 0xFF;
        data[1] = 0x1;
        data[2] = 0x5;
        data[3] = flag;

        _this.hid.SetHidWrite(dev.BaseInfo.DeviceId, 0xff, 16, data); 

    }

    initDTS(dev) {
        env.log('CommonHeadsetSeries', "initDTS","begin...");
        var index = dev.deviceData.profileindex;

        //Set setDTSMode
        var modeNum = dev.deviceData.profile[index].mode;
        var DTSObj = {
            mode:modeNum,
            value31:dev.deviceData.profile[index].equlizer[modeNum].value31,
            value62:dev.deviceData.profile[index].equlizer[modeNum].value62,
            value125:dev.deviceData.profile[index].equlizer[modeNum].value125,
            value250:dev.deviceData.profile[index].equlizer[modeNum].value250,
            value500:dev.deviceData.profile[index].equlizer[modeNum].value500,
            value1K:dev.deviceData.profile[index].equlizer[modeNum].value1K,
            value2K:dev.deviceData.profile[index].equlizer[modeNum].value2K,
            value4K:dev.deviceData.profile[index].equlizer[modeNum].value4K,
            value8K:dev.deviceData.profile[index].equlizer[modeNum].value8K,
            value16K:dev.deviceData.profile[index].equlizer[modeNum].value16K
        }; 

        _this.setDTSMode(DTSObj, function(data) {
            if(data == 1) {
                _this.setEQValue(DTSObj,function(){ callback() });
            }
        });

        //Set Dashboard
        var DashboardObj = {
            VirtualizationValue:dev.deviceData.profile[index].dashboard.VirtualizationValue,
            LoudnessValue:dev.deviceData.profile[index].dashboard.LoudnessValue,
            DialogEnhancementValue:dev.deviceData.profile[index].dashboard.DialogEnhancementValue,
            BassValue:dev.deviceData.profile[index].dashboard.BassValue,
            HeadphoneEQValue:dev.deviceData.profile[index].dashboard.HeadphoneEQValue
        }

        _this.setModeValue(DashboardObj)

        //Set SurroundSound
        var SurroundSoundObj = {
            EnvironmentValue:dev.deviceData.profile[index].surroundsound.EnvironmentValue,
            StereoValue:dev.deviceData.profile[index].surroundsound.StereoValue,
            VolumeL:dev.deviceData.profile[index].surroundsound.VolumeL,
            VolumeR:dev.deviceData.profile[index].surroundsound.VolumeR,
            VolumeC:dev.deviceData.profile[index].surroundsound.VolumeC,
            VolumeLFE:dev.deviceData.profile[index].surroundsound.VolumeLFE,
            VolumeFL:dev.deviceData.profile[index].surroundsound.VolumeFL,
            VolumeFR:dev.deviceData.profile[index].surroundsound.VolumeFR,
            VolumeSL:dev.deviceData.profile[index].surroundsound.VolumeSL,
            VolumeSR:dev.deviceData.profile[index].surroundsound.VolumeSR,
            EnableDTSValue:dev.deviceData.profile[index].surroundsound.EnableDTSValue
        }

        _this.setRoom(SurroundSoundObj);
        _this.setStereoPreference(SurroundSoundObj);
        //_this.SetVolumChannel("7.1 Game Sound", 0, SurroundSoundObj.VolumeFL);
        // _this.SetVolumChannel("7.1 Game Sound", 1, SurroundSoundObj.VolumeFR);
        // _this.SetVolumChannel("7.1 Game Sound", 2, SurroundSoundObj.VolumeC);
        // _this.SetVolumChannel("7.1 Game Sound", 3, SurroundSoundObj.VolumeLFE);
        // _this.SetVolumChannel("7.1 Game Sound", 4, SurroundSoundObj.VolumeSL);
        // _this.SetVolumChannel("7.1 Game Sound", 5, SurroundSoundObj.VolumeSR);
        // _this.SetVolumChannel("7.1 Game Sound", 6, SurroundSoundObj.VolumeL);
        // _this.SetVolumChannel("7.1 Game Sound", 7, SurroundSoundObj.VolumeR);
    }

    initLED(dev) {
        env.log('CommonHeadsetSeries', "initLED","begin...");
        var index = dev.deviceData.profileindex;

        //Set setDTSMode
        var ApMode = dev.deviceData.profile[index].ApMode;
        if(ApMode) {
            //Run Ap mode
            _this.ApmodeService.StartApmode(1,function(){})

        }else {
            //Run Spectrum mode
            var ledObj = {
                lightingvalue:dev.deviceData.profile[index].lighting.value,
                BrightnessValue:dev.deviceData.profile[index].lighting.BrightnessValue,
                SpeedValue:dev.deviceData.profile[index].lighting.SpeedValue,
                SpectrumValue:dev.deviceData.profile[index].lighting.SpectrumValue,
                color:dev.deviceData.profile[index].lighting.color,
                ColorSectionArray:dev.deviceData.profile[index].lighting.ColorSectionArray,
                DurationValue:dev.deviceData.profile[index].lighting.DurationValue,
                StartValue:dev.deviceData.profile[index].lighting.StartValue,
                StopValue:dev.deviceData.profile[index].lighting.StopValue,
                DirectionValue:dev.deviceData.profile[index].lighting.DirectionValue
            }
            _this.setLighting(dev, ledObj);
        }
    }

    initMicrophone(dev) {
        env.log('CommonHeadsetSeries', "initMicrophone","begin...");
        var index = dev.deviceData.profileindex;

        //Set setMicrophone volume
        var iMicVolumeValue = dev.deviceData.profile[index].microphone.MicVolumeValueTemp;
        _this.SetMicrophoneVolume(iMicVolumeValue);

        //Set SideToTone
        var iMicMonitor = dev.deviceData.profile[index].microphone.MicMonitor;
        _this.setSideToneToDevice(dev, iMicMonitor);

    }

    DTSChange(dev, objData) {
        var index = dev.deviceData.profileindex;
        // var dtsON_Path = path.join(env.appRoot,"/other/dts_on_16k.wav");
        // var dtsOFF_Path = path.join(env.appRoot,"/other/dts_off_16k.wav");
        if(objData.DTSFlag == false) {
            var Obj2 = {
                Func: evtType.PlayAudio,
                SN: dev.BaseInfo.SN, 
                Param: "dts_on_16k.mp3"
            };
            _this.emit(evtType.ProtocolMessage, Obj2);

            var modeNum = dev.deviceData.profile[index].mode;

            var obj = {
                mode : modeNum,
                value31:dev.deviceData.profile[index].equlizer[modeNum].value31,
                value62:dev.deviceData.profile[index].equlizer[modeNum].value62,
                value125:dev.deviceData.profile[index].equlizer[modeNum].value125,
                value250:dev.deviceData.profile[index].equlizer[modeNum].value250,
                value500:dev.deviceData.profile[index].equlizer[modeNum].value500,
                value1K:dev.deviceData.profile[index].equlizer[modeNum].value1K,
                value2K:dev.deviceData.profile[index].equlizer[modeNum].value2K,
                value4K:dev.deviceData.profile[index].equlizer[modeNum].value4K,
                value8K:dev.deviceData.profile[index].equlizer[modeNum].value8K,
                value16K:dev.deviceData.profile[index].equlizer[modeNum].value16K
            };
            //console.log('11111  obj', obj);

            _this.setDTSMode(obj, function(data) {
                _this.setEQValue(obj,function(){ callback() });
            });
        }
        else {
            var Obj2 = {
                Func: evtType.PlayAudio,
                SN: dev.BaseInfo.SN, 
                Param: "dts_off_16k.mp3"
            };
            _this.emit(evtType.ProtocolMessage, Obj2);
            var obj = {mode : 8}; //off
            _this.setDTSMode(obj, function(data) {
            });
        }
    }

    VolumedownIntervalFunc() {
        var volume = _this.GetVolumeValue("7.1 Game Sound", -1);
        volume = (volume.toFixed(2) * 10) - 0.2;
        _this.SetVolumChannel("7.1 Game Sound", -1, volume);
        var blance_volume = 10 - volume;
        _this.SetVolumChannel("Chat Sound", -1, blance_volume);
    }

    VolumeupIntervalFunc() {
        var volume = _this.GetVolumeValue("7.1 Game Sound", -1);
        volume = (volume.toFixed(2) * 10) + 0.2;
        _this.SetVolumChannel("7.1 Game Sound", -1, volume);
        var blance_volume = 10 - volume;
        _this.SetVolumChannel("Chat Sound", -1, blance_volume);
    }



    HIDReadData(dev, objData) {
        // var index = dev.deviceData.profileindex;
        // dev.deviceData.profile[index]
        // if(objData[0] == 0x01 && objData[1] == 0x20)
        //     console.log('LED')
        // else if(objData[0] == 0x01 && objData[1] == 0x80)
        //     console.log('DTS')
        //     console.log('2222222 HIDReadData deviceData mode', dev.deviceData.profile[index].mode);
        
        //Mode change
        if(objData[0] == 0x01 && objData[1] == 0x40) {

            //Get Volume
            var volume = _this.GetVolumeValue("7.1 Game Sound", -1);

            volume = volume.toFixed(2) * 10;
            var blance_volume = 10 - volume;

            if(objData[2] == 0) {
                //balance
                _this.SetVolumChannel("Chat Sound", -1, blance_volume);

                var Obj2 = {
                    Func: evtType.PlayAudio,
                    SN: dev.BaseInfo.SN, 
                    Param: "balance_16k.mp3"
                };
                _this.emit(evtType.ProtocolMessage, Obj2);  
            }
            else {
                //master
                _this.SetVolumChannel("Chat Sound", -1, volume);

                var Obj2 = {
                    Func: evtType.PlayAudio,
                    SN: dev.BaseInfo.SN, 
                    Param: "master_16k.mp3"
                };
                _this.emit(evtType.ProtocolMessage, Obj2);
            }
        }else if(objData[0] == 0x01 && objData[1] == 0x08 && objData[2] == 0x01) {
            //balance volume down
            _this.volumeDownObj = setInterval(_this.VolumedownIntervalFunc, 100);

        }else if(objData[0] == 0x01 && objData[1] == 0x10 && objData[2] == 0x01) {
            //balance volume up
            _this.volumeUpObj = setInterval(_this.VolumeupIntervalFunc, 100);
        }else if(objData[0] == 0x01 && objData[1] == 0 && objData[2] == 0x01) {
            if (_this.volumeDownObj != undefined)
                clearInterval(_this.volumeDownObj);
            if (_this.volumeDownObj != undefined)
                clearInterval(_this.volumeUpObj);
        }
    }

    setDashboard(dev, obj, callback) {
        var index = dev.deviceData.profileindex;

        dev.deviceData.profile[index].dashboard.VirtualizationValue = obj.VirtualizationValue;
        dev.deviceData.profile[index].dashboard.LoudnessValue = obj.LoudnessValue;
        dev.deviceData.profile[index].dashboard.DialogEnhancementValue = obj.DialogEnhancementValue;
        dev.deviceData.profile[index].dashboard.BassValue = obj.BassValue;
        dev.deviceData.profile[index].dashboard.HeadphoneEQValue = obj.HeadphoneEQValue;

        //console.log('setDashboard', obj);
        // console.log('dev', JSON.stringify(dev.deviceData.profile[index]));


        _this.setModeValue(obj)
        if(obj.VirtualizationValue)
            _this.setRoom(obj)
        callback();
    }

    setEqulizer(dev, obj, callback) {
        var index = dev.deviceData.profileindex;
        dev.deviceData.profile[index].mode = obj.mode;

        dev.deviceData.profile[index].equlizer[obj.mode].value31 = obj.value31;
        dev.deviceData.profile[index].equlizer[obj.mode].value62 = obj.value62;
        dev.deviceData.profile[index].equlizer[obj.mode].value125 = obj.value125;
        dev.deviceData.profile[index].equlizer[obj.mode].value250 = obj.value250;
        dev.deviceData.profile[index].equlizer[obj.mode].value500 = obj.value500;
        dev.deviceData.profile[index].equlizer[obj.mode].value1K = obj.value1K;
        dev.deviceData.profile[index].equlizer[obj.mode].value2K = obj.value2K;
        dev.deviceData.profile[index].equlizer[obj.mode].value4K = obj.value4K;
        dev.deviceData.profile[index].equlizer[obj.mode].value8K = obj.value8K;
        dev.deviceData.profile[index].equlizer[obj.mode].value16K = obj.value16K;

        //console.log('22222222 setEqulizer :',obj);
        //console.log('dev', JSON.stringify(dev.deviceData.profile[index]));

        _this.setDTSMode(obj, function(data) {
            if(data == 1) {
                _this.setEQValue(obj,function(){ callback() });
            } else
                callback();
        });
    }

    setSurroundSound(dev, obj, callback) {
        var index = dev.deviceData.profileindex;

        dev.deviceData.profile[index].surroundsound.EnvironmentValue = obj.EnvironmentValue;
        dev.deviceData.profile[index].surroundsound.StereoValue = obj.StereoValue;
        dev.deviceData.profile[index].surroundsound.VolumeL = obj.VolumeL;
        dev.deviceData.profile[index].surroundsound.VolumeR = obj.VolumeR;
        dev.deviceData.profile[index].surroundsound.VolumeC = obj.VolumeC;
        dev.deviceData.profile[index].surroundsound.VolumeLFE = obj.VolumeLFE;
        dev.deviceData.profile[index].surroundsound.VolumeFL = obj.VolumeFL;
        dev.deviceData.profile[index].surroundsound.VolumeFR = obj.VolumeFR;
        dev.deviceData.profile[index].surroundsound.VolumeSL = obj.VolumeSL;
        dev.deviceData.profile[index].surroundsound.VolumeSR = obj.VolumeSR;
        dev.deviceData.profile[index].surroundsound.EnableDTSValue = obj.EnableDTSValue;

        //console.log('setSurroundSound', obj);
        // console.log('dev', JSON.stringify(dev.deviceData.profile[index]));

        _this.setRoom(obj);
        _this.setStereoPreference(obj);
        // _this.SetVolumChannel("7.1 Game Sound", 0, obj.VolumeFL);
        // _this.SetVolumChannel("7.1 Game Sound", 1, obj.VolumeFR);
        // _this.SetVolumChannel("7.1 Game Sound", 2, obj.VolumeC);
        // _this.SetVolumChannel("7.1 Game Sound", 3, obj.VolumeLFE);
        // _this.SetVolumChannel("7.1 Game Sound", 4, obj.VolumeSL);
        // _this.SetVolumChannel("7.1 Game Sound", 5, obj.VolumeSR);
        // _this.SetVolumChannel("7.1 Game Sound", 6, obj.VolumeL);
        // _this.SetVolumChannel("7.1 Game Sound", 7, obj.VolumeR);
        callback();
    }

    setMicrophone(dev, obj, callback) {
        console.log('setMicrophone obj :',obj);
        _this.SetMicrophoneVolume(obj.MicVolumeValueTemp);
        _this.setSideToneToDevice(dev, obj.MicMonitor);
        callback();
    }


    /**
     * 
     * @param {*} 
     * name => device name
     * channel => -1 : Master Channel Volume, 0-7 : channel 
     */
    GetVolumeValue(name, channel) {
        var volume = _this.dtsController.GetDeviceVolume(name, channel);
        return volume;
    }

    /**
     * 
     * @param {*} obj 
     * @param {*} callback 
     * name => device name
     * channel => -1:Master channel, 0:左前, 1: 右前, 2:中前, 3:重低, 4:左後, 5:右後, 6:左側, 7:右側
     * volume => 音量大小 (0-100)
     *          
    */
    SetVolumChannel(name, channel, volume) {
        _this.dtsController.SetDeviceVolume(name, channel, volume * 10)
    }

    /**
     * 
     * @param {*} obj 
     * @param {*} callback 
     *
     * "A08s Gaming Headset" => device name
     * volume => 麥克風大小 (0-100)
     *          
    */
    SetMicrophoneVolume(volume) {
        _this.dtsController.SetDeviceMicrophoneVolume("A08s Gaming Headset", volume);
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
        if(obj != undefined)
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
        // env.log('CommonHeadsetSeries','setLEDPatten', obj);
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

        _this.hid.SetHidWrite(dev.BaseInfo.DeviceId, 0xff, 16, data);
    }

    /**
     * 
     * @param {*} dev 
     * @param {*} obj 
     * volume: 0-7 音量大小聲
     */
    setSideToneToDevice(dev, obj) {
        console.log('setSideToneToDevice obj :',obj)

        if(obj > 0)
            obj = 5;

        var data = Buffer.alloc(16);
        data[0] = 0xFF;
        data[1] = 0x01;
        data[2] = 0x06;
        data[3] = obj;

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
                console.log('setLightToDevice', obj.ColorArray.length, obj.ColorArray);

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
            env.log('CommonHeadsetSeries','setLighting', 'begin...');
            console.log('setLighting obj', obj);
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

module.exports = CommonHeadsetSeries;