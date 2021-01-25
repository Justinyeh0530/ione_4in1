declare var System;
import { Injectable, EventEmitter} from '@angular/core';
import { DeviceService } from './DeviceService.service'
let electron_Instance = window['System']._nodeRequire('electron').remote; 
let funcVar = System._nodeRequire('./backend/others/FunctionVariable')
import { CommonService } from './CommonService.service'
import {TranslateService} from 'ng2-translate';
import * as _ from 'lodash'
import { ThrowStmt } from '@angular/compiler/src/output/output_ast';

@Injectable()
export class HeadsetFunctionService{
    dbService = electron_Instance.getGlobal('AppProtocol').deviceService.nedbObj
    updateColorSection: EventEmitter<object> = new EventEmitter();
    removeColorSection: EventEmitter<number> = new EventEmitter();
    addColorSection: EventEmitter<number> = new EventEmitter();
    MusicPreset = [
        { name: "Music", value:0, translate: 'Music'},
        { name: 'Movie', value: 1, translate: 'Movie'},
        { name: 'Voice', value: 2, translate: 'Voice'},
        { name: 'GAME(FPS)', value: 3, translate: 'GAME(FPS)'},
        { name: 'GAME(MOBA)', value: 4, translate: 'GAME(MOBA)'},
        { name: 'GAME(MMO)', value: 5, translate: 'GAME(MMO)'},
        { name: 'CUSTOM1', value: 6, translate: 'CUSTOM1'},
        { name: 'CUSTOM2', value: 7, translate: 'CUSTOM2'},
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
        { name: 'Rain', value: 6, translate: 'Rain'},
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
        A: 0,
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

    constructor(
        private deviceService: DeviceService,
        private commonService: CommonService,
        private translateService: TranslateService,
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
        if(this.HeadsetProfileData != undefined) {
            //init dashboard
            this.VirtualizationValue = this.HeadsetProfileData[this.profileindex].dashboard.VirtualizationValue;
            this.LoudnessValue = this.HeadsetProfileData[this.profileindex].dashboard.LoudnessValue;
            this.DialogEnhancementValue = this.HeadsetProfileData[this.profileindex].dashboard.DialogEnhancementValue;

            //init Equlizer
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
            this.StereoValue = this.HeadsetProfileData[this.profileindex].surroundsound.StereoValue
        }
    }

    initSpectrum() {
            //init Spectrum
            let index = this.LightingEffect.findIndex(x => x.value == this.HeadsetProfileData[this.profileindex].lighting.value);
            if(index != -1)
                this.headsetLightEffectSelect = _.clone(this.LightingEffect[index]);
            else
                this.headsetLightEffectSelect =  _.clone(this.LightingEffect[0]);
                console.log('index', index, this.headsetLightEffectSelect)
            this.BrightnessValue = this.HeadsetProfileData[this.profileindex].lighting.BrightnessValue;
            this.SpeedValue = this.HeadsetProfileData[this.profileindex].lighting.SpeedValue;
            this.SpectrumValue = this.HeadsetProfileData[this.profileindex].lighting.SpectrumValue;
            this.CurrentLightingTempColor = this.HeadsetProfileData[this.profileindex].lighting.color;
            if(this.headsetLightEffectSelect.value != 0 && this.headsetLightEffectSelect.value != 3) {
                setTimeout(() =>{
                    document.getElementById(`Alternation-color1`).style.backgroundColor = `rgb(${this.CurrentLightingTempColor[0][0]},${this.CurrentLightingTempColor[0][1]},${this.CurrentLightingTempColor[0][2]})`;
                    document.getElementById(`Alternation-color2`).style.backgroundColor = `rgb(${this.CurrentLightingTempColor[1][0]},${this.CurrentLightingTempColor[1][1]},${this.CurrentLightingTempColor[1][2]})`;
                })
            }
    }

    /**
     * 
     * @param flag 0:Dashboard 1:Equlizer 2:Micro Phone 3:Surround Sound
     */
    HeadsetFuncSave(flag) {
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
    }

    /**
     * set headset Dashboard function to device
     */
    SetHeadsetDashboard() {
        let obj = {
            Type: funcVar.FuncType.Headset,
            SN: this.deviceService.currentDevice.SN,
            Func: funcVar.FuncName.ImportProfile,
            param: {
                VirtualizationValue: this.VirtualizationValue,
                LoudnessValue: this.LoudnessValue,
                DialogEnhancementValue: this.DialogEnhancementValue,
                BassValue: this.BassValue,
                HeadphoneEQValue: this.HeadphoneEQValue
            }
        }
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].dashboard.VirtualizationValue = this.VirtualizationValue;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].dashboard.LoudnessValue = this.LoudnessValue;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].dashboard.DialogEnhancementValue = this.DialogEnhancementValue;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].dashboard.BassValue = this.BassValue;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].dashboard.HeadphoneEQValue = this.HeadphoneEQValue;
    }
    /**
     * set headset Equlizer function to device
     */
    SetHeadsetEqulizer() {
        let obj = {
            Type: funcVar.FuncType.Headset,
            SN: this.deviceService.currentDevice.SN,
            Func: funcVar.FuncName.ImportProfile,
            param: {
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
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value125 = this.value125;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value250 = this.value250;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value500 = this.value500;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value1K = this.value1K;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value2K = this.value2K;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value4K = this.value4K;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value8K = this.value8K;
        this.deviceService.currentDevice.pluginDevice.deviceData.profile[this.profileindex].equlizer[this.equlizereDataSelect.value].value16K = this.value16K;
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
                VolumeSR: this.VolumeSR
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
    }

    /**
     * Headset Surround Volume Down
     * @param ValueName 
     */
    VolumeArrowLeftClick(ValueName) {
        this[ValueName]--;
        if(this[ValueName] <= 0)
            this[ValueName] = 0
    }

    /**
     * Headset Surround Volume Up
     * @param ValueName 
     */
    VolumeArrowRightClick(ValueName) {
        this[ValueName]++;
        if(this[ValueName] >= 10)
            this[ValueName] = 10
    }

    HeadsetDashborad(ValueName) {
        this[ValueName] = !this[ValueName];
    }

    
    /**
     * Select Lighting Effect
     */
    HeadsetLightEffectSelect() {
        this.ResetLightingEffectDefault();
    }

    /**
     * color picker 當滑鼠放開時觸發
     * @param event 
     */
    ColorChange(event) {
        console.log('ColorChange:',event)
        if(this.switchDscFlag)
            this.dbService.updateDevice(this.deviceService.currentDevice.SN, this.deviceService.currentDevice.pluginDevice.deviceData);
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
            this.CurrentLightingTempColor[this.AlternationFlag - 1][0] = this.ColorPickerColor.R;
            this.CurrentLightingTempColor[this.AlternationFlag - 1][1] = this.ColorPickerColor.G;
            this.CurrentLightingTempColor[this.AlternationFlag - 1][2] = this.ColorPickerColor.B;
        }
    }

    SetLightingArea(flag) {
        this.LightingArea = flag;
        if(flag == 1) 
            this.LightingEffect = _.cloneDeep(this.HeadsetLightEffectData);
        else if(flag == 2)
            this.LightingEffect = _.cloneDeep(this.HeadsetLightLogoEffectData)
    }

    EqulizereSelect() {
        this.value125 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value125;
        this.value250 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value250;
        this.value500 = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value500;
        this.value1K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value1K;
        this.value2K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value2K;
        this.value4K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value4K;
        this.value8K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value8K;
        this.value16K = this.HeadsetProfileData[this.profileindex].equlizer[this.equlizereDataSelect.value].value16K;
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
    }

    SpectrumSave() {
        document.getElementById('color-item2').style.backgroundColor = document.getElementById('color-item1').style.backgroundColor;
        this.HeadsetProfileData[this.profileindex].lighting.value = this.headsetLightEffectSelect.value;
        this.HeadsetProfileData[this.profileindex].lighting.BrightnessValue = this.BrightnessValue;
        this.HeadsetProfileData[this.profileindex].lighting.SpeedValue = this.SpeedValue;
        this.HeadsetProfileData[this.profileindex].lighting.SpectrumValue = this.SpectrumValue;
        this.HeadsetProfileData[this.profileindex].lighting.color = this.CurrentLightingTempColor
        this.dbService.updateDevice(this.deviceService.currentDevice.SN, this.deviceService.currentDevice.pluginDevice.deviceData);
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
    }

    SpectrumClick() {
        this.SpectrumValue = !this.SpectrumValue
    }

    AlternationColorClick(id) {
        this.AlternationFlag = id
        document.getElementById('color-item1').style.backgroundColor = document.getElementById(`Alternation-color${id}`).style.backgroundColor
        document.getElementById('color-item2').style.backgroundColor = document.getElementById(`Alternation-color${id}`).style.backgroundColor
    }

    ColorSectionChange(event) {

    }

    /**
     * 切換燈校時, 載入預設值
     */
    ResetLightingEffectDefault() {
        this.AlternationFlag = 0;
        this.SpectrumValue = true;
        this.BrightnessValue = 5;
        this.SpeedValue = 5;
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
}