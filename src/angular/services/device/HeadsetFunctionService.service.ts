declare var System;
import { Injectable, EventEmitter } from '@angular/core';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import { DeviceService } from './DeviceService.service'
let electron_Instance = window['System']._nodeRequire('electron').remote; 
let funcVar = System._nodeRequire('./backend/others/FunctionVariable')
import * as _ from 'lodash'

@Injectable()
export class HeadsetFunctionService{
    dbService = electron_Instance.getGlobal('AppProtocol').deviceService.nedbObj
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

    constructor(
        private deviceService: DeviceService,
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
        this.headsetLightEffectSelect = this.LightingEffect[0]
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

    ColorChange(event) {
        console.log('ColorChange:',event)
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
}