declare var System;
import { Injectable, EventEmitter} from '@angular/core';
import { DeviceService } from './DeviceService.service'
let electron_Instance = window['System']._nodeRequire('electron').remote; 
let funcVar = System._nodeRequire('./backend/others/FunctionVariable')
import { CommonService } from './CommonService.service'
import {TranslateService} from 'ng2-translate';
import * as _ from 'lodash'
import {protocolService} from '../service/protocol.service';

@Injectable()
export class HeadsetFunctionService{
    dbService = electron_Instance.getGlobal('AppProtocol').deviceService.nedbObj
    updateColorSection: EventEmitter<object> = new EventEmitter();
    removeColorSection: EventEmitter<number> = new EventEmitter();
    addColorSection: EventEmitter<number> = new EventEmitter();
    refreshEQEvent: EventEmitter<number> = new EventEmitter();
    refreshMicEvent: EventEmitter<number> = new EventEmitter();
    MusicPreset = [
        { name: "Music", value:0, translate: 'Music'},
        { name: 'Movie', value: 1, translate: 'Movie'},
        { name: 'Voice', value: 2, translate: 'Voice'},
        { name: 'GAME(FPS)', value: 3, translate: 'GAME(FPS)'},
        { name: 'GAME(MOBA)', value: 4, translate: 'GAME(MOBA)'},
        { name: 'GAME(MMO)', value: 5, translate: 'GAME(MMO)'},
        { name: 'CUSTOM1', value: 6, translate: 'CUSTOM1'},
        // { name: 'CUSTOM2', value: 7, translate: 'CUSTOM2'},
        { name: 'OFF', value: 8, translate: 'OFF'},
    ]
    LightingEffect = [];
    HeadsetLightEffectData = [
        { name: 'static', value: 0, translate: 'static'},
        { name: 'Breathing', value: 1, translate: 'Breathing'},
        { name: 'Radar', value: 2, translate: 'Radar'},
        { name: 'Wave', value: 3, translate: 'Wave'},
        { name: 'Color Shift', value: 4, translate: 'Color Shift'},
        { name: 'Spiral Rainbow', value: 5, translate: 'Spiral Rainbow'},
        { name: 'Flash', value: 6, translate: 'Flash'},
        { name: 'Led Off', value: 7, translate: 'Led Off'},
    ]
    HeadsetLightLogoEffectData = [
        { name: 'static', value: 0, translate: 'static'},
        { name: 'Breathing', value: 1, translate: 'Breathing'},
        { name: 'Color Shift', value: 2, translate: 'Color Shift'},
        { name: 'Led Off', value: 3, translate: 'Led Off'},
    ]
    VirtualizationValue:boolean = false;
    LoudnessValue:boolean = false;
    DialogEnhancementValue:boolean = false;
    BassValue:boolean = false;
    HeadphoneEQValue:boolean = false;
    StereoValue:number = 1;
    EnvironmentValue:number = 1;
    VolumeL:number = 10;
    VolumeR:number = 10;
    VolumeC:number = 10;
    VolumeLFE:number = 10;
    VolumeFL:number = 10;
    VolumeFR:number = 10;
    VolumeSL:number = 10;
    VolumeSR:number = 10;
    value31:number = 50;
    value62:number = 50;
    value125:number = 50;
    value250:number = 50;
    value500:number = 50;
    value1K:number = 50;
    value2K:number = 50;
    value4K:number = 50;
    value8K:number = 50;
    value16K:number = 50;
    MicVolumeValueTemp:number = 50;
    MicVolumeBoundsValueTemp:number = 50;
    MicSideToneValueTemp:number = 50;
    equlizereDataSelect:any;
    headsetLightEffectSelect:any;
    LightingArea:number = 1;
    HeadsetProfileData:any;
    profileindex:number = 0;
    ColorPickerColor = {
        R: 0,
        G: 0,
        B: 255,
        A: 100,
        hex: '0000FF'
    };
    switchDscFlag:boolean = false;
    switchDefaultColor = [
        [255,0,0],
        [255,165,0],
        [255,255,0],
        [0,128,0],
        [106,255,249],
        [0,0,255],
        [238, 130, 238]
    ]
    switchColorArrowFlag:number = -1;

    BrightnessValue:number = 5;
    SpeedValue:number = 5;
    SpectrumValue:boolean = true;
    AlternationFlag:number = 0;
    CurrentLightingTempColor:any;
    DurationValue:number = 2;
    EnableDTSValue:number = 0;

    ColorSectionArray:any = [
        {value:0, left:0, color:[255, 0, 0, 1]},
        {value:1, left:39, color:[255, 165, 0, 1]},
        {value:2, left:95, color:[255, 255, 0, 1]},
        {value:3, left:151, color:[0, 128, 0, 1]},
        {value:4, left:207, color:[106, 255, 249, 1]},
        {value:5, left:263, color:[0, 0, 255, 1]},
        {value:6, left:319, color:[75, 0, 130, 1]},
        {value:7, left:343, color:[238, 130, 238, 1]}
    ]
    dotindex:number = -1;
    ColorShiftStartList:any = [
        {name: 'widthprofile', value: 0, translate: 'widthprofile'},
        {name: 'test', value: 1, translate: 'test'}
    ];
    ColorShiftStartSelect:any;

    ColorShiftStopList:any = [
        {name: 'Onkeypress', value: 0, translate: 'Onkeypress'},
        {name: 'test', value: 1, translate: 'test'}
    ]
    ColorShiftStopSelect:any;

    DirectionList:any = [
        {name: 'Clockwise', value: 0, translate: 'Clockwise'},
        {name: 'CounterClockwise', value: 1, translate: 'CounterClockwise'}
    ]
    DirectionSelect:any;

    StepArray:any = [];
    StepArrayIndex:number = 0;
    StepDashBoardArray:any = [];
    TempDashBoardArray:any = {};
    StepSurroundSoundArray:any = [];
    TempSurroundSoundArray:any = {};
    StepMicophoneArray:any = [];
    TempMicophoneArray:any = {};
    StepEqulizerArray:any = [];
    TempEqulizerArray:any = {};
    Templighting:any = [];

    constructor(
        private deviceService: DeviceService,
        private commonService: CommonService,
        private translateService: TranslateService,
        private protocol: protocolService
        ){
            this.deviceService.updatCurrentDeviceData.subscribe((data) => {
                if(data.pluginDevice != undefined && data.ModelType == 3) {
                    this.HeadsetProfileData = this.deviceService.currentDevice.pluginDevice.deviceData.profile;
                    this.profileindex = this.deviceService.currentDevice.pluginDevice.deviceData.profileindex;
                    this.initData();
                } else if(data.ModelType == 3){
                    this.HeadsetProfileData = this.deviceService.currentDevice.defaultProfile;
                    this.profileindex = this.deviceService.currentDevice.profileindex;
                    this.initData();
                }
            })
            this.initData();
    }
    initData() {
        this.equlizereDataSelect = this.MusicPreset[0];
        this.LightingEffect = this.HeadsetLightEffectData;
        this.headsetLightEffectSelect =  _.clone(this.LightingEffect[0])
        this.ColorShiftStartSelect = _.clone(this.ColorShiftStartList[0]);
        this.ColorShiftStopSelect = _.clone(this.ColorShiftStopList[0]);
        this.DirectionSelect = _.clone(this.DirectionList[0])
        if(this.HeadsetProfileData != undefined) {
            //init dashboard
            this.VirtualizationValue = this.HeadsetProfileData[this.profileindex].dashboard.VirtualizationValue;
            this.LoudnessValue = this.HeadsetProfileData[this.profileindex].dashboard.LoudnessValue;
            this.DialogEnhancementValue = this.HeadsetProfileData[this.profileindex].dashboard.DialogEnhancementValue;
            this.BassValue = this.HeadsetProfileData[this.profileindex].dashboard.BassValue;
            this.HeadphoneEQValue = this.HeadsetProfileData[this.profileindex].dashboard.HeadphoneEQValue;

            //init Equlizer
            this.value31 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value31;
            this.value62 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value62;
            this.value125 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value125;
            this.value250 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value250;
            this.value500 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value500;
            this.value1K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value1K;
            this.value2K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value2K;
            this.value4K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value4K;
            this.value8K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value8K;
            this.value16K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value16K;

            //init Micro phone
            this.MicVolumeValueTemp = this.HeadsetProfileData[this.profileindex].microphone.MicVolumeValueTemp;
            this.MicVolumeBoundsValueTemp = this.HeadsetProfileData[this.profileindex].microphone.MicVolumeBoundsValueTemp;
            this.MicSideToneValueTemp = this.HeadsetProfileData[this.profileindex].microphone.MicSideToneValueTemp;

            //init surroundsound
            this.VolumeL = this.HeadsetProfileData[this.profileindex].surroundsound.VolumeL;
            this.VolumeR = this.HeadsetProfileData[this.profileindex].surroundsound.VolumeR;
            this.VolumeC = this.HeadsetProfileData[this.profileindex].surroundsound.VolumeC;
            this.VolumeLFE = this.HeadsetProfileData[this.profileindex].surroundsound.VolumeLFE;
            this.VolumeFL = this.HeadsetProfileData[this.profileindex].surroundsound.VolumeFL;
            this.VolumeFR = this.HeadsetProfileData[this.profileindex].surroundsound.VolumeFR;
            this.VolumeSL = this.HeadsetProfileData[this.profileindex].surroundsound.VolumeSL;
            this.VolumeSR = this.HeadsetProfileData[this.profileindex].surroundsound.VolumeSR;
            this.EnvironmentValue = this.HeadsetProfileData[this.profileindex].surroundsound.EnvironmentValue;
            this.StereoValue = this.HeadsetProfileData[this.profileindex].surroundsound.StereoValue;
            this.EnableDTSValue = this.HeadsetProfileData[this.profileindex].surroundsound.EnableDTSValue;

            //init templighting
            this.Templighting = this.HeadsetProfileData[this.profileindex].templighting;
            
            //init Array
            this.ResetArrayIndex();
        }
    }

    initSpectrum() {
        //init Spectrum
        let index = this.LightingEffect.findIndex(x => x.value == this.HeadsetProfileData[this.profileindex].lighting.value);
        if(index != -1)
            this.headsetLightEffectSelect = _.clone(this.LightingEffect[index]);
        else
            this.headsetLightEffectSelect =  _.clone(this.LightingEffect[0]);
        this.BrightnessValue = this.HeadsetProfileData[this.profileindex].lighting.BrightnessValue;
        this.SpeedValue = this.HeadsetProfileData[this.profileindex].lighting.SpeedValue;
        this.SpectrumValue = this.HeadsetProfileData[this.profileindex].lighting.SpectrumValue;
        this.CurrentLightingTempColor = this.HeadsetProfileData[this.profileindex].lighting.color;
        this.ColorSectionArray = this.HeadsetProfileData[this.profileindex].lighting.ColorSectionArray;
        this.DurationValue = this.HeadsetProfileData[this.profileindex].lighting.DurationValue;
        setTimeout(() => {
            this.ColorShiftStartSelect = _.clone(this.ColorShiftStartList[this.HeadsetProfileData[this.profileindex].lighting.StartValue]);
            this.ColorShiftStopSelect = _.clone(this.ColorShiftStopList[this.HeadsetProfileData[this.profileindex].lighting.StopValue]);
            this.DirectionSelect = _.clone(this.DirectionList[this.HeadsetProfileData[this.profileindex].lighting.DirectionValue]);
        },500);
        if(this.headsetLightEffectSelect.value != 0 && this.headsetLightEffectSelect.value != 3) {
            setTimeout(() =>{
                if(document.getElementById(`Alternation-color1`)) {
                    document.getElementById(`Alternation-color1`).style.backgroundColor = `rgb(${this.CurrentLightingTempColor[0][0]},${this.CurrentLightingTempColor[0][1]},${this.CurrentLightingTempColor[0][2]})`;
                    document.getElementById(`Alternation-color2`).style.backgroundColor = `rgb(${this.CurrentLightingTempColor[1][0]},${this.CurrentLightingTempColor[1][1]},${this.CurrentLightingTempColor[1][2]})`;
                }
            })
        } else if(this.headsetLightEffectSelect.value == 0) {
            setTimeout(() =>{
                if(document.getElementById(`Alternation-color1`)) {
                    document.getElementById(`Alternation-color1`).style.backgroundColor = `rgb(${this.CurrentLightingTempColor[0][0]},${this.CurrentLightingTempColor[0][1]},${this.CurrentLightingTempColor[0][2]})`;
                }
            })
        }
    }

    /**
     * 
     * @param flag 0:Dashboard 1:Equlizer 2:Micro Phone 3:Surround Sound
     */
    HeadsetFuncSave(flag) {
        this.commonService.delayDialog('main-app',500)
        if(flag == 0)
            this.SetHeadsetDashboard();
        else if(flag == 1)
            this.SetHeadsetEqulizer();
        else if(flag == 2)
            this.SetHeadsetMacrophone();
        else if(flag == 3)
            this.SetHeadsetSurroundSound();
        if(this.deviceService.currentDevice.pluginDevice != undefined)
            this.dbService.updateDevice(this.deviceService.currentDevice.SN, this.deviceService.currentDevice.pluginDevice.deviceData);

        //通知後端 todo
    }

    /**
     * set headset Dashboard function to device
     */
    SetHeadsetDashboard() {
        // let obj = {
        //     Type: funcVar.FuncType.Headset,
        //     SN: this.deviceService.currentDevice.SN,
        //     Func: funcVar.FuncName.ImportProfile,
        //     param: {
        //         VirtualizationValue: this.VirtualizationValue,
        //         LoudnessValue: this.LoudnessValue,
        //         DialogEnhancementValue: this.DialogEnhancementValue,
        //         BassValue: this.BassValue,
        //         HeadphoneEQValue: this.HeadphoneEQValue
        //     }
        // }
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].dashboard.VirtualizationValue = this.VirtualizationValue;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].dashboard.LoudnessValue = this.LoudnessValue;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].dashboard.DialogEnhancementValue = this.DialogEnhancementValue;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].dashboard.BassValue = this.BassValue;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].dashboard.HeadphoneEQValue = this.HeadphoneEQValue;
        this.setHardware(0);
    }
    /**
     * set headset Equlizer function to device
     */
    SetHeadsetEqulizer() {
        // let obj = {
        //     Type: funcVar.FuncType.Headset,
        //     SN: this.deviceService.currentDevice.SN,
        //     Func: funcVar.FuncName.ImportProfile,
        //     param: {
        //         mode: this.equlizereDataSelect.value,
        //         value31: this.value31,
        //         value62: this.value62,
        //         value125: this.value125,
        //         value250: this.value250,
        //         value500: this.value500,
        //         value1K: this.value1K,
        //         value2K: this.value2K,
        //         value4K: this.value4K,
        //         value8K: this.value8K,
        //         value16K: this.value16K,
        //     }
        // }
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value31 = this.value31;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value62 = this.value62;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value125 = this.value125;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value250 = this.value250;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value500 = this.value500;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value1K = this.value1K;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value2K = this.value2K;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value4K = this.value4K;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value8K = this.value8K;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value16K = this.value16K;
        this.setHardware(1);
    }

    /**
     * set headset Macro Phone function to device
     */
    SetHeadsetMacrophone() {
        let obj = {
            Type: funcVar.FuncType.Headset,
            SN: this.deviceService.currentDevice.SN,
            Func: funcVar.FuncName.ImportProfile,
            param: {
                MicVolumeValueTemp: this.MicVolumeValueTemp,
                MicVolumeBoundsValueTemp: this.MicVolumeBoundsValueTemp,
                MicSideToneValueTemp: this.MicSideToneValueTemp
            }
        }
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].microphone.MicVolumeValueTemp = this.MicVolumeValueTemp;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].microphone.MicVolumeBoundsValueTemp = this.MicVolumeBoundsValueTemp;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].microphone.MicSideToneValueTemp = this.MicSideToneValueTemp;
    }

    /** 
     *  set headset Surround Sound to device
    */
    SetHeadsetSurroundSound() {
        let obj = {
            Type: funcVar.FuncType.Headset,
            SN: this.deviceService.currentDevice.SN,
            Func: funcVar.FuncName.ImportProfile,
            param: {
                EnvironmentValue: this.EnvironmentValue,
                StereoValue: this.StereoValue,
                VolumeL: this.VolumeL,
                VolumeR: this.VolumeR,
                VolumeC: this.VolumeC,
                VolumeLFE: this.VolumeLFE,
                VolumeFL: this.VolumeFL,
                VolumeFR: this.VolumeFR,
                VolumeSL: this.VolumeSL,
                VolumeSR: this.VolumeSR,
                EnableDTSValue: this.EnableDTSValue
            }
        }
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.VolumeL = this.VolumeL;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.VolumeR = this.VolumeR;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.VolumeC = this.VolumeC;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.VolumeLFE = this.VolumeLFE;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.VolumeFL = this.VolumeFL;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.VolumeFR = this.VolumeFR;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.VolumeSL = this.VolumeSL;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.VolumeSR = this.VolumeSR;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.EnvironmentValue = this.EnvironmentValue;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.StereoValue = this.StereoValue;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].surroundsound.EnableDTSValue = this.EnableDTSValue;
    }

    /**
     * Headset Surround Volume Down
     * @param ValueName 
     */
    VolumeArrowLeftClick(ValueName) {
        if(this[ValueName] == 0)
            return;
        this[ValueName]--;
        this.pushStepSurroundSoundArray(ValueName,this[ValueName])
    }

    /**
     * Headset Surround Volume Up
     * @param ValueName 
     */
    VolumeArrowRightClick(ValueName) {
        if(this[ValueName] == 10)
            return;
        this[ValueName]++;
        this.pushStepDashBoardArray(ValueName,this[ValueName])
    }

    HeadsetDashborad(ValueName) {
        this[ValueName] = !this[ValueName];
        this.pushStepDashBoardArray(ValueName,this[ValueName])
    }

    
    /**
     * Select Lighting Effect
     */
    HeadsetLightEffectSelect() {
        this.ResetLightingEffectDefault();

        let index = this.Templighting.findIndex(x => x.value == this.headsetLightEffectSelect.value)
        if(index != -1) {
            this.BrightnessValue = this.Templighting[index].BrightnessValue;
            this.ColorSectionArray = this.Templighting[index].ColorSectionArray;
            let DirectionIndex = this.DirectionList.findIndex(x => x.value == this.Templighting[index].DirectionValue)
            setTimeout(() => {
                if(DirectionIndex != -1)
                    this.DirectionSelect = this.DirectionList[DirectionIndex];
                else
                    this.DirectionSelect = this.DirectionList[0];
            },500);
            this.DurationValue = this.Templighting[index].DurationValue;
            this.SpectrumValue = this.Templighting[index].SpectrumValue;
            this.SpeedValue = this.Templighting[index].SpeedValue;
            this.CurrentLightingTempColor = this.Templighting[index].color;

            if(this.headsetLightEffectSelect.value != 0 && this.headsetLightEffectSelect.value != 3) {
                setTimeout(() =>{
                    if(document.getElementById(`Alternation-color1`)) {
                        document.getElementById(`Alternation-color1`).style.backgroundColor = `rgb(${this.CurrentLightingTempColor[0][0]},${this.CurrentLightingTempColor[0][1]},${this.CurrentLightingTempColor[0][2]})`;
                        document.getElementById(`Alternation-color2`).style.backgroundColor = `rgb(${this.CurrentLightingTempColor[1][0]},${this.CurrentLightingTempColor[1][1]},${this.CurrentLightingTempColor[1][2]})`;
                    }
                })
            } else if(this.headsetLightEffectSelect.value == 0) {
                setTimeout(() =>{
                    if(document.getElementById(`Alternation-color1`)) {
                        document.getElementById(`Alternation-color1`).style.backgroundColor = `rgb(${this.CurrentLightingTempColor[0][0]},${this.CurrentLightingTempColor[0][1]},${this.CurrentLightingTempColor[0][2]})`;
                    }
                })
            }
        }
    }

    
    DirectionClick() {
        this.updateTemplightData();
    }

    /**
     * color picker 當滑鼠放開時觸發
     * @param event 
     */
    ColorChange(event) {
        console.log('ColorChange:',event)
        if(this.switchDscFlag && this.deviceService.currentDevice.pluginDevice != undefined)
            this.dbService.updateDevice(this.deviceService.currentDevice.SN, this.deviceService.currentDevice.pluginDevice.deviceData);
        if(this.headsetLightEffectSelect.value == 3 && this.dotindex != -1) {
            let index = this.ColorSectionArray.findIndex(x => x.value == this.dotindex);
            if(index != -1) {
                this.ColorSectionArray[index].color = [event.R, event.G, event.B, event.A/100];
                this.updateColorSection.emit(this.ColorSectionArray);
            }
        }
    }

    /**
     * color picker 當滑鼠移動時就會觸發
     * @param event 
     */
    DynamicColorChange(event) {
        this.ColorPickerColor.R = event.R
        this.ColorPickerColor.G = event.G
        this.ColorPickerColor.B = event.B
        this.ColorPickerColor.hex = this.commonService.rgbToHex(this.ColorPickerColor.R, this.ColorPickerColor.G, this.ColorPickerColor.B).split('#')[1]
        if(document.getElementById('color-item1'))
            document.getElementById('color-item1').style.backgroundColor = "#" + this.ColorPickerColor.hex;
        if(this.switchDscFlag && document.getElementById('color-switch-list' + this.switchColorArrowFlag)) {
            console.log('color-switch-list' + this.switchColorArrowFlag, `rgb(${this.ColorPickerColor.R},${this.ColorPickerColor.G},${this.ColorPickerColor.B})`)
            this.HeadsetProfileData[this.profileindex].customColor[this.switchColorArrowFlag][0] = this.ColorPickerColor.R;
            this.HeadsetProfileData[this.profileindex].customColor[this.switchColorArrowFlag][1] = this.ColorPickerColor.G;
            this.HeadsetProfileData[this.profileindex].customColor[this.switchColorArrowFlag][2] = this.ColorPickerColor.B;
        }
        if(!this.SpectrumValue) {
            if(document.getElementById(`Alternation-color${this.AlternationFlag}`))
                document.getElementById(`Alternation-color${this.AlternationFlag}`).style.backgroundColor = `rgb(${this.ColorPickerColor.R},${this.ColorPickerColor.G},${this.ColorPickerColor.B})`;
            if(this.AlternationFlag !- 0) {
                this.CurrentLightingTempColor[this.AlternationFlag - 1][0] = this.ColorPickerColor.R;
                this.CurrentLightingTempColor[this.AlternationFlag - 1][1] = this.ColorPickerColor.G;
                this.CurrentLightingTempColor[this.AlternationFlag - 1][2] = this.ColorPickerColor.B;
            }
        }
        this.updateTemplightData();
    }

    SetLightingArea(flag) {
        this.LightingArea = flag;
        if(flag == 1) 
            this.LightingEffect = _.cloneDeep(this.HeadsetLightEffectData);
        else if(flag == 2)
            this.LightingEffect = _.cloneDeep(this.HeadsetLightLogoEffectData)
    }

    EqulizereSelect() {
        this.value31 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value31;
        this.value62 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value62;
        this.value125 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value125;
        this.value250 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value250;
        this.value500 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value500;
        this.value1K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value1K;
        this.value2K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value2K;
        this.value4K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value4K;
        this.value8K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value8K;
        this.value16K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value16K;
        let obj = {
            equlizereDataSelect: this.equlizereDataSelect,
            value31: this.value31,
            value62: this.value62,
            value125: this.value125,
            value250: this.value250,
            value500: this.value500,
            value1K: this.value1K,
            value2K: this.value2K,
            value4K: this.value4K,
            value8K: this.value8K,
            value16K: this.value16K
        }
        this.TempEqulizerArray = _.cloneDeep(obj)
        this.pushStepEquizerArray('equlizereDataSelect', this.equlizereDataSelect);
    }

    resetCurrentColor() {
        document.getElementById('color-item1').style.backgroundColor = document.getElementById('color-item2').style.backgroundColor;
        let color:any =  document.getElementById('color-item2').style.backgroundColor;
        if(color.indexOf('rgb') != -1) {
            color = color.split('rgb(')[1]
            color = color.split(')')[0]
            this.ColorPickerColor.R = color.split(',')[0];
            this.ColorPickerColor.G = color.split(',')[1];
            this.ColorPickerColor.B = color.split(',')[2];
            this.ColorPickerColor.hex = this.commonService.rgbToHex(this.ColorPickerColor.R, this.ColorPickerColor.G, this.ColorPickerColor.B).split('#')[1]
        } else if(color.indexOf('#') != -1) {
            this.ColorPickerColor.hex = color.split('#')[0];
            let RGB = this.commonService.hexToRgb(this.ColorPickerColor.hex)
            this.ColorPickerColor.R = RGB.r;
            this.ColorPickerColor.G = RGB.g;
            this.ColorPickerColor.B = RGB.b;
        }
        this.updateTemplightData();
    }

    /**
     * this.switchDscFlag  false: Basic, true:Custom
     */
    checkSwitchDsc() {
        let text = ""
        if(this.switchDscFlag) {
            for(let i = 0; i <= 6; i++) 
                document.getElementById(`color-switch-list${i}`).style.backgroundColor = `rgb(${this.HeadsetProfileData[this.profileindex].customColor[i][0]}, ${this.HeadsetProfileData[this.profileindex].customColor[i][1]}, ${this.HeadsetProfileData[this.profileindex].customColor[i][2]})`
            text = "CUSTOM";
        } else {
            for(let i = 0; i <= 6; i++) 
                document.getElementById(`color-switch-list${i}`).style.backgroundColor = `rgb(${this.switchDefaultColor[i][0]}, ${this.switchDefaultColor[i][1]}, ${this.switchDefaultColor[i][2]})`
            text = "BASIC";
        }
        return text;
    }

    switchDsc() {
        this.switchDscFlag = !this.switchDscFlag;
    }

    /**
     * 設定Customer Color內的某個Color
     * @param id 
     */
    setSwitchColor(id) {
        this.switchColorArrowFlag = id;
        let color:any = document.getElementById(`color-switch-list${id}`).style.backgroundColor;
        if(color.indexOf('rgb') != -1) {
            color = color.split('rgb(')[1];
            color = color.split(')')[0];
            this.ColorPickerColor.R = color.split(',')[0];
            this.ColorPickerColor.G = color.split(',')[1];
            this.ColorPickerColor.B = color.split(',')[2];
            this.ColorPickerColor.hex = this.commonService.rgbToHex(this.ColorPickerColor.R, this.ColorPickerColor.G, this.ColorPickerColor.B).split('#')[1]
        } else if(color.indexOf('#') != -1) {
            this.ColorPickerColor.hex = color.split('#')[0];
            let RGB = this.commonService.hexToRgb(this.ColorPickerColor.hex)
            this.ColorPickerColor.R = RGB.r;
            this.ColorPickerColor.G = RGB.g;
            this.ColorPickerColor.B = RGB.b;
        }
        if(document.getElementById('color-item1'))
            document.getElementById('color-item1').style.backgroundColor = "#" + this.ColorPickerColor.hex;

        if(this.headsetLightEffectSelect.value == 3 && this.dotindex != -1) {
            let index = this.ColorSectionArray.findIndex(x => x.value == this.dotindex);
            if(index != -1) {
                this.ColorSectionArray[index].color = [ this.ColorPickerColor.R,  this.ColorPickerColor.G,  this.ColorPickerColor.B,  this.ColorPickerColor.A/100];
                this.updateColorSection.emit(this.ColorSectionArray);
            }
        }
        this.updateTemplightData();
    }

    SpectrumSave() {
        this.commonService.delayDialog('main-app',500);
        if(document.getElementById('color-item2'))
            document.getElementById('color-item2').style.backgroundColor = document.getElementById('color-item1').style.backgroundColor;

        this.HeadsetProfileData[this.profileindex].lighting.value = this.headsetLightEffectSelect.value;
        this.HeadsetProfileData[this.profileindex].lighting.BrightnessValue = this.BrightnessValue;
        this.HeadsetProfileData[this.profileindex].lighting.SpeedValue = this.SpeedValue;
        this.HeadsetProfileData[this.profileindex].lighting.SpectrumValue = this.SpectrumValue;
        this.HeadsetProfileData[this.profileindex].lighting.color = this.CurrentLightingTempColor;
        this.HeadsetProfileData[this.profileindex].lighting.ColorSectionArray = this.ColorSectionArray;
        this.HeadsetProfileData[this.profileindex].lighting.DurationValue = this.DurationValue;
        this.HeadsetProfileData[this.profileindex].lighting.StartValue = this.ColorShiftStartSelect.value;
        this.HeadsetProfileData[this.profileindex].lighting.StopValue = this.ColorShiftStopSelect.value;
        this.HeadsetProfileData[this.profileindex].lighting.DirectionValue = this.DirectionSelect.value;
        //更新templighting資料
        this.updateTemplightData();

        //通知後端 todo
        this.setHardware(4)
    }

    /**
     * 
     * @param flag 0:Dashboard 1:Equlizer 2:Microphone 3:Surround Sound 4:spectrum
     */
    setHardware(flag) {
        let obj = {};
        if(flag == 0) {
            obj = {
                Type: funcVar.FuncType.Device,
                SN: this.deviceService.currentDevice.SN,
                Func: funcVar.FuncName.setDashboard,
                Param: {
                    VirtualizationValue: this.VirtualizationValue,
                    LoudnessValue: this.LoudnessValue,
                    DialogEnhancementValue: this.DialogEnhancementValue,
                    BassValue: this.BassValue,
                    HeadphoneEQValue: this.HeadphoneEQValue
                }
            }
        } else if(flag == 1) {
            obj = {
                Type: funcVar.FuncType.Device,
                SN: this.deviceService.currentDevice.SN,
                Func: funcVar.FuncName.setEqulizer,
                Param: {
                    mode: this.equlizereDataSelect.value,
                    value31: this.value31,
                    value62: this.value62,
                    value125: this.value125,
                    value250: this.value250,
                    value500: this.value500,
                    value1K: this.value1K,
                    value2K: this.value2K,
                    value4K: this.value4K,
                    value8K: this.value8K,
                    value16K: this.value16K,
                }
            }
        } else if(flag == 2) {

        } else if(flag == 3) {

        } else if(flag == 4) {
            let data = {
                lightingvalue : this.HeadsetProfileData[this.profileindex].lighting.value,
                BrightnessValue: this.HeadsetProfileData[this.profileindex].lighting.BrightnessValue,
                SpeedValue: this.HeadsetProfileData[this.profileindex].lighting.SpeedValue,
                SpectrumValue: this.HeadsetProfileData[this.profileindex].lighting.SpectrumValue,
                color: this.HeadsetProfileData[this.profileindex].lighting.color,
                ColorSectionArray: this.HeadsetProfileData[this.profileindex].lighting.ColorSectionArray,
                DurationValue : this.HeadsetProfileData[this.profileindex].lighting.DurationValue,
                StartValue: this.HeadsetProfileData[this.profileindex].lighting.StartValue,
                StopValue: this.HeadsetProfileData[this.profileindex].lighting.StopValue,
                DirectionValue: this.HeadsetProfileData[this.profileindex].lighting.DirectionValue
            }

            obj = {
                Type: funcVar.FuncType.Device,
                SN: this.deviceService.currentDevice.SN,
                Func: funcVar.FuncName.setLighting,
                Param: data
            }
        }
        if(obj.hasOwnProperty("Type"))
            this.protocol.RunSetFunction(obj).then((data)=>{});
    }

    SliderChange(id) {
        // switch(id) {
        //     case 'Brightness':
        //         this.HeadsetProfileData[this.profileindex].lighting.BrightnessValue = this.BrightnessValue;
        //         break;
        //     case 'Speed':
        //         this.HeadsetProfileData[this.profileindex].lighting.SpeedValue = this.SpeedValue;
        //         break;
        // }
        this.updateTemplightData();
    }

    SpectrumClick() {
        this.SpectrumValue = !this.SpectrumValue
        this.updateTemplightData()
    }

    AlternationColorClick(id) {
        this.AlternationFlag = id
        document.getElementById('color-item1').style.backgroundColor = document.getElementById(`Alternation-color${id}`).style.backgroundColor
        document.getElementById('color-item2').style.backgroundColor = document.getElementById(`Alternation-color${id}`).style.backgroundColor
        this.updateTemplightData();
    }

    ColorSectionChange(event) {
        this.ColorSectionArray = event.Array;
        this.dotindex = event.dotindex;
    }

    addColor() {
        let value = Math.max.apply(Math, this.ColorSectionArray.map(function(o) {return o.value}))
        this.addColorSection.emit(value);
        this.updateTemplightData();
        // this.dbService.updateDevice(this.deviceService.currentDevice.SN, this.deviceService.currentDevice.pluginDevice.deviceData);
    }

    removeColor() {
        if(this.dotindex != -1) {
            let index = this.ColorSectionArray.findIndex(x => x.value == this.dotindex)
            if(index != -1) {
                this.ColorSectionArray.splice(index, 1);
                let data = this.dotindex;
                this.removeColorSection.emit(data);
                this.dotindex = -1;
                this.updateTemplightData();
                // this.dbService.updateDevice(this.deviceService.currentDevice.SN, this.deviceService.currentDevice.pluginDevice.deviceData);
            }
        }
    }

    /**
     * 切換燈校時, 載入預設值
     */
    ResetLightingEffectDefault() {
        this.AlternationFlag = 0;
        this.SpectrumValue = true;
        this.BrightnessValue = 5;
        this.SpeedValue = 5;
        this.DurationValue = 2;
        this.dotindex = -1;
        this.switchColorArrowFlag = -1;
        this.ColorSectionArray = [
            {value:0, left:0, color:[255, 0, 0, 1]},
            {value:1, left:39, color:[255, 165, 0, 1]},
            {value:2, left:95, color:[255, 255, 0, 1]},
            {value:3, left:151, color:[0, 128, 0, 1]},
            {value:4, left:207, color:[106, 255, 249, 1]},
            {value:5, left:263, color:[0, 0, 255, 1]},
            {value:6, left:319, color:[75, 0, 130, 1]},
            {value:7, left:343, color:[238, 130, 238, 1]}
        ]
        this.CurrentLightingTempColor = [[0,0,255],[255,0,0]];
        this.ColorShiftStartSelect = _.clone(this.ColorShiftStartList[0]);
        this.ColorShiftStopSelect = _.clone(this.ColorShiftStopList[0]);
        this.DirectionSelect = _.clone(this.DirectionList[0])
        switch(this.headsetLightEffectSelect.value) {
            case 0:
                this.BrightnessValue = 5;
                this.CurrentLightingTempColor = [[255,0,0]]
                break;
            case 1:
                this.BrightnessValue = 5;
                this.SpeedValue = 5;
                setTimeout(() => {
                    document.getElementById('Alternation-color1').style.backgroundColor = "rgb(0,0,255)";
                    document.getElementById('Alternation-color2').style.backgroundColor = "rgb(255,0,0)";
                });
                this.CurrentLightingTempColor = [[0,0,255],[255,0,0]]
                break;
        }
    }

    HeadsetSurroundSoundEnvironment(value) {
        this.EnvironmentValue = value;
        this.pushStepSurroundSoundArray('EnvironmentValue', value)
    }

    HeadsetSurroundSoundStereo(value) {
        this.StereoValue = value;
        this.pushStepSurroundSoundArray('StereoValue', value)
    }

    HeadsetMicrophone(param) {
        this.pushStepMicrophoneArray(param, this[param])
    }

    HeadsetEQ(param) {
        this.pushStepEquizerArray(param, this[param])
    }

    pushStepDashBoardArray(param,value) {
        this.TempDashBoardArray = _.cloneDeep(this.TempDashBoardArray)
        this.TempDashBoardArray[param] = value;
        //假如不是最後一筆資料, 移除index後的資料並加入新的資料
        for(let i = this.StepArrayIndex; i < this.StepDashBoardArray.length - 1; i++)
            this.StepDashBoardArray.pop();
        this.StepDashBoardArray.push(this.TempDashBoardArray);
        this.StepArrayIndex++;
    }

    DashboardUndo() {
        if(this.StepArrayIndex <= 0)
            return;
        this.StepArrayIndex--;
        let obj:any = this.commonService.getObjectDetail(this.StepDashBoardArray[this.StepArrayIndex]);
        for(let i = 0; i < obj.length; i++)
            this[obj[i].key] = obj[i].value;
        this.TempDashBoardArray = _.cloneDeep(this.StepDashBoardArray[this.StepArrayIndex])
    }

    DashboardRedo() {
        if(this.StepArrayIndex <= this.StepDashBoardArray.length - 2) {
            this.StepArrayIndex++;
            let obj:any = this.commonService.getObjectDetail(this.StepDashBoardArray[this.StepArrayIndex]);
            for(let i = 0; i < obj.length; i++)
                this[obj[i].key] = obj[i].value;
            this.TempDashBoardArray = _.cloneDeep(this.StepDashBoardArray[this.StepArrayIndex])
        }
    }

    pushStepSurroundSoundArray(param,value) {
        this.TempSurroundSoundArray = _.cloneDeep(this.TempSurroundSoundArray)
        this.TempSurroundSoundArray[param] = value;
        for(let i = this.StepArrayIndex; i < this.StepSurroundSoundArray.length - 1; i++)
            this.StepSurroundSoundArray.pop();
        this.StepSurroundSoundArray.push(this.TempSurroundSoundArray);
        this.StepArrayIndex++;
    }

    SurroundSoundUndo() {
        if(this.StepArrayIndex <= 0)
        return;
        this.StepArrayIndex--;
        let obj:any = this.commonService.getObjectDetail(this.StepSurroundSoundArray[this.StepArrayIndex]);
        for(let i = 0; i < obj.length; i++)
            this[obj[i].key] = obj[i].value;
        this.TempSurroundSoundArray = _.cloneDeep(this.StepSurroundSoundArray[this.StepArrayIndex])
    }

    SurroundSoundRedo() {
        if(this.StepArrayIndex <= this.StepSurroundSoundArray.length - 2) {
            this.StepArrayIndex++;
            let obj:any = this.commonService.getObjectDetail(this.StepSurroundSoundArray[this.StepArrayIndex]);
            for(let i = 0; i < obj.length; i++)
                this[obj[i].key] = obj[i].value;
            this.TempSurroundSoundArray = _.cloneDeep(this.StepSurroundSoundArray[this.StepArrayIndex])
        }
    }

    pushStepMicrophoneArray(param, value) {
        this.TempMicophoneArray = _.cloneDeep(this.TempMicophoneArray)
        this.TempMicophoneArray[param] = value;
        for(let i = this.StepArrayIndex; i < this.StepMicophoneArray.length - 1; i++)
            this.StepMicophoneArray.pop();
        this.StepMicophoneArray.push(this.TempMicophoneArray);
        this.StepArrayIndex++;
    }

    MicrophoneUndo() {
        if(this.StepArrayIndex <= 0)
            return;
        this.StepArrayIndex--;
        let obj:any = this.commonService.getObjectDetail(this.StepMicophoneArray[this.StepArrayIndex]);
        for(let i = 0; i < obj.length; i++)
            this[obj[i].key] = obj[i].value;
        this.TempMicophoneArray = _.cloneDeep(this.StepMicophoneArray[this.StepArrayIndex])
    }

    MicrophoneRedo() {
        if(this.StepArrayIndex <= this.StepMicophoneArray.length - 2) {
            this.StepArrayIndex++;
            let obj:any = this.commonService.getObjectDetail(this.StepMicophoneArray[this.StepArrayIndex]);
            for(let i = 0; i < obj.length; i++)
                this[obj[i].key] = obj[i].value;
            this.TempMicophoneArray = _.cloneDeep(this.StepMicophoneArray[this.StepArrayIndex])
        }
    }

    pushStepEquizerArray(param,value) {
        this.TempEqulizerArray = _.cloneDeep(this.TempEqulizerArray)
        this.TempEqulizerArray[param] = value;
        for(let i = this.StepArrayIndex; i < this.StepEqulizerArray.length - 1; i++)
            this.StepEqulizerArray.pop();
        this.StepEqulizerArray.push(this.TempEqulizerArray);
        this.StepArrayIndex++;
    }

    EqulizerUndo() {
        if(this.StepArrayIndex <= 0)
            return;
        this.StepArrayIndex--;
        let obj:any = this.commonService.getObjectDetail(this.StepEqulizerArray[this.StepArrayIndex]);
        for(let i = 0; i < obj.length; i++)
            this[obj[i].key] = obj[i].value;
        this.TempEqulizerArray = _.cloneDeep(this.StepEqulizerArray[this.StepArrayIndex])
        this.refreshEQEvent.emit();
    }

    EqulizerRedo() {
        if(this.StepArrayIndex <= this.StepEqulizerArray.length - 2) {
            this.StepArrayIndex++;
            let obj:any = this.commonService.getObjectDetail(this.StepEqulizerArray[this.StepArrayIndex]);
            for(let i = 0; i < obj.length; i++)
                this[obj[i].key] = obj[i].value;
            this.TempEqulizerArray = _.cloneDeep(this.StepEqulizerArray[this.StepArrayIndex])
            this.refreshEQEvent.emit();
        }
    }

    ResetArrayIndex() {
        this.StepArrayIndex = 0;
        this.StepDashBoardArray = [];
        this.TempDashBoardArray = _.cloneDeep(this.HeadsetProfileData[this.profileindex].dashboard)
        this.StepDashBoardArray.push(this.HeadsetProfileData[this.profileindex].dashboard);
        this.StepSurroundSoundArray = [];
        this.TempSurroundSoundArray = _.cloneDeep(this.HeadsetProfileData[this.profileindex].surroundsound)
        this.StepSurroundSoundArray.push(this.HeadsetProfileData[this.profileindex].surroundsound);
        this.StepMicophoneArray = [];
        this.TempMicophoneArray = _.cloneDeep(this.HeadsetProfileData[this.profileindex].microphone)
        this.StepMicophoneArray.push(this.HeadsetProfileData[this.profileindex].microphone);
        this.StepEqulizerArray = [];
        let obj = {
            equlizereDataSelect: this.equlizereDataSelect,
            value31: this.value31,
            value62: this.value62,
            value125: this.value125,
            value250: this.value250,
            value500: this.value500,
            value1K: this.value1K,
            value2K: this.value2K,
            value4K: this.value4K,
            value8K: this.value8K,
            value16K: this.value16K
        }
        this.TempEqulizerArray = _.cloneDeep(obj)
        this.StepEqulizerArray.push(obj);
    }

    updateTemplightData() {
        let lightIndex = this.Templighting.findIndex(x => x.value == this.headsetLightEffectSelect.value)
        if(lightIndex != -1) {
            this.Templighting[lightIndex].BrightnessValue = this.BrightnessValue;
            this.Templighting[lightIndex].SpeedValue = this.SpeedValue;
            this.Templighting[lightIndex].SpectrumValue = this.SpectrumValue;
            this.Templighting[lightIndex].color = this.CurrentLightingTempColor;
            this.Templighting[lightIndex].ColorSectionArray = this.ColorSectionArray;
            this.Templighting[lightIndex].DurationValue = this.DurationValue;
            this.Templighting[lightIndex].StartValue = this.ColorShiftStartSelect.value;
            this.Templighting[lightIndex].StopValue = this.ColorShiftStopSelect.value;
            this.Templighting[lightIndex].DirectionValue = this.DirectionSelect.value
            this.HeadsetProfileData[this.profileindex].templighting = this.Templighting
        }
        if(this.deviceService.currentDevice.pluginDevice != undefined)
            this.dbService.updateDevice(this.deviceService.currentDevice.SN, this.deviceService.currentDevice.pluginDevice.deviceData);
    }

    SurroundSoundReset() {

    }

    EnableDTS() {
        if(this.EnableDTSValue == 0)
            this.EnableDTSValue = 1;
        else
            this.EnableDTSValue = 0;
    }

    /**
     * Reset Function
     * @param flag  1.Equlizer 2.Mic Volume 3.Mic Side Tone
     */
    reset(flag) {
        let mic;
        let defaultData = this.deviceService.currentDevice.defaultProfile[0];
        switch(flag) {
            case 1:
                let equlizer = defaultData.equlizer;
                let index = equlizer.findIndex(x => x.value == this.equlizereDataSelect.value)
                if(index != -1) {
                    this.value31 = equlizer[index].value31;
                    this.value62 = equlizer[index].value62;
                    this.value125 = equlizer[index].value125;
                    this.value250 = equlizer[index].value250;
                    this.value500 = equlizer[index].value500;
                    this.value1K = equlizer[index].value1K;
                    this.value2K = equlizer[index].value2K;
                    this.value4K = equlizer[index].value4K;
                    this.value8K = equlizer[index].value8K;
                    this.value16K = equlizer[index].value16K;
                    this.refreshEQEvent.emit();
                }
                break;
            case 2:
                mic = defaultData.microphone;
                this.MicVolumeValueTemp = mic.MicVolumeValueTemp;
                this.MicVolumeBoundsValueTemp = mic.MicVolumeBoundsValueTemp;
                this.refreshMicEvent.emit();
                break;
            case 3:
                mic = defaultData.microphone;
                this.MicSideToneValueTemp = mic.MicSideToneValueTemp;
                this.refreshMicEvent.emit();
                break;
        }
    }
}