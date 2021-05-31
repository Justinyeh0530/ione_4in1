declare var System;
import { Injectable, EventEmitter, ViewChild } from '@angular/core';
let electron_Instance = window['System']._nodeRequire('electron').remote; 
import { TranslateService, LangChangeEvent } from 'ng2-translate';
import { CommonService } from './index';
import { protocolService } from '../../services/service/protocol.service'
let funcVar = System._nodeRequire('./backend/others/FunctionVariable');
import * as _ from 'lodash'

@Injectable()
export class ActionSyncService{
    updateColorSection: EventEmitter<object> = new EventEmitter();
    removeColorSection: EventEmitter<number> = new EventEmitter();
    addColorSection: EventEmitter<number> = new EventEmitter();
    frameSelectionEvent: EventEmitter<boolean> = new EventEmitter();
    lightinglistdialogflag:boolean = false;
    dbService = electron_Instance.getGlobal('AppProtocol').deviceService.nedbObj;
    opacityvalue: number = 50;
    speedvalue: number = 5;
    bandwidthvalue: number = 450;
    anglevalue:number = 0;
    gapvalue:number = 0;
    numbervalue:number = 5;
    firevalue:number = 5;
    amplitudevalue:number = 500;
    gradientvalue:boolean = true;
    directionvalue:boolean = true;
    fadvalue:boolean = false;
    bidirectionalvalue:boolean = true;
    separatevalue:boolean = false;
    bumpvalue:boolean = false;
    LightingEffectData = [
        { name: 'Static', value: 0, translate: 'Static'},
        { name: 'Wave', value: 1, translate: 'Wave'},
        { name: 'ConicBand', value: 2, translate: 'ConicBand'},
        { name: 'Spiral', value: 3, translate: 'Spiral'},
        { name: 'Cycle', value: 4, translate: 'Cycle'},
        { name: 'LinearWave', value: 5, translate: 'LinearWave'},
        { name: 'Ripple', value: 6, translate: 'Ripple'},
        { name: 'Breathing', value: 7, translate: 'Breathing'},
        { name: 'Rain', value: 8, translate: 'Rain'},
        { name: 'Fire', value: 9, translate: 'Fire'},
        { name: 'Reactive', value: 10, translate: 'Reactive'},
        { name: 'AudioCap', value: 11, translate: 'AudioCap'},
    ];
    asyncsyncLightingCard:any;
    actionSyncDevicFlag:number = 0;
    apModeData = {layerlist:[], Device:[], center:{x:0, y:0}, index:0};
    apDeviceList:any = [];

    ColorSectionArray = [
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
    zoomvalue:number = 10;
    devicedragflag:boolean = false;
    lightingcenterdragflag:boolean = false;
    deviceframeselectflag:boolean = false;

    //event
    clickshowEvent:any;
    selectlayerEvent:any;
    selectlightEvent:any;

    constructor(
        private translateService: TranslateService,
        private protocol: protocolService,
        private commonService: CommonService
    ){
        document.addEventListener('click',(event) => {
            if(this.lightinglistdialogflag && event.target.id.indexOf('actionsync-lighting-select') == -1) {
                document.getElementById('actionsync-lightinglist').style.display = 'none';
                this.lightinglistdialogflag = false;
            }
        })
    }

    resetflag() {
        this.devicedragflag = false;
        this.deviceframeselectflag = false;
        this.actionSyncDevicFlag = 0;
    }

    InitData() {
        let card = document.getElementById('actionsync-layer-temp');
        this.asyncsyncLightingCard = card.cloneNode(true);
        card.style.display = "none";
        this.clickshowEvent = this.clickshow.bind(this);
        this.selectlayerEvent = this.selectlayer.bind(this);
        this.selectlightEvent = this.selectlight.bind(this);
        this.dbService.getApMode().then((data) => {
            this.apModeData = _.cloneDeep(data);
            for(let i = 0; i < this.apModeData.layerlist.length; i++) {
                this.createLayer(this.apModeData.layerlist[i].index, this.apModeData.layerlist[i].value, this.apModeData.layerlist[i].enable, 0)
            }
            if(this.apModeData.index != 0) {
                document.getElementById("actionsync-layer-temp" + this.apModeData.index).style.background = "white";
                document.getElementById("actionsync-lighting-dsc" + this.apModeData.index).style.color = "black";
                let layerindex = this.getlayerlistindex()
                if(layerindex != undefined) {
                    this.ColorSectionArray = this.apModeData.layerlist[layerindex].ColorSectionArray;
                    this.updateColorSection.emit(this.ColorSectionArray)
                }
            }
        })
    }

    StartApMode() {
        let obj={
            Type:funcVar.FuncType.Apmode,
            Func:funcVar.FuncName.StartApmode,
            SN:"",
            Param: this.apModeData
        }
        this.protocol.RunSetFunction(obj).then((data)=>{
            console.log('Set ApMode Finish');
        });
    }

    initDevice() {
        console.log('init APMode Device')
    }

    ActionSyncLightingSelect(event) {
        let contentPanelId = $(event.target).attr('id')
        let index = contentPanelId.replace(/[^0-9]/ig,"");
        if(!this.lightinglistdialogflag) {
            this.lightinglistdialogflag = true;
            document.getElementById('actionsync-lightinglist').style.display = "flex";
            document.getElementById('actionsync-lightinglist').style.top = document.getElementById('actionsync-lighting-select' + index).offsetTop + 220 + 'px';
        } else {
            this.lightinglistdialogflag = false;
            document.getElementById('actionsync-lightinglist').style.display = "none";
        }
    }

    /**
     * 切換Layer燈校
     */
    selectActionSyncLighting(index) {
        this.translateService.get(this.LightingEffectData[index].translate).subscribe((res: string) => {
            document.getElementById("actionsync-lighting-dsc" + this.apModeData.index).value = res;
            let layerindex = this.apModeData.layerlist.findIndex(x => x.index == this.apModeData.index);
            if(layerindex != -1) {
                this.actionSyncDeviceFunc(0)
                this.apModeData.layerlist[layerindex].value = index;
                this.setightParamToDefault(index);
                this.updateColorSectionArray();
                this.save();
            }
        })
    }

    save() {
        let index = this.apModeData.layerlist.findIndex(x => x.index == this.apModeData.index)
        if(index != -1) {
            this.apModeData.layerlist[index].opacityvalue = this.opacityvalue;
            this.apModeData.layerlist[index].speedvalue = this.speedvalue;
            this.apModeData.layerlist[index].bandwidthvalue = this.bandwidthvalue;
            this.apModeData.layerlist[index].anglevalue = this.anglevalue;
            this.apModeData.layerlist[index].gapvalue = this.gapvalue;
            this.apModeData.layerlist[index].numbervalue = this.numbervalue;
            this.apModeData.layerlist[index].firevalue = this.firevalue;
            this.apModeData.layerlist[index].amplitudevalue = this.amplitudevalue;
            this.apModeData.layerlist[index].gradientvalue = this.gradientvalue;
            this.apModeData.layerlist[index].directionvalue = this.directionvalue;
            this.apModeData.layerlist[index].fadvalue = this.fadvalue;
            this.apModeData.layerlist[index].bidirectionalvalue = this.bidirectionalvalue;
            this.apModeData.layerlist[index].separatevalue = this.separatevalue;
            this.apModeData.layerlist[index].bumpvalue = this.bumpvalue;
            this.dbService.updateApMode(this.apModeData).then(() => {
                this.commonService.delayDialog('main-app',500);
                let obj={
                    Type:funcVar.FuncType.Apmode,
                    Func:funcVar.FuncName.StartApmode,
                    SN:"",
                    Param: this.apModeData
                }
                this.protocol.RunSetFunction(obj).then((data)=>{
                    console.log('Set ApMode Finish');
                });
            })
        }
    }

    addlayer() {
        let index = 0;
        if(this.apModeData.layerlist.length > 0) 
            index = this.apModeData.layerlist[this.apModeData.layerlist.length - 1].index;
        index++;
        this.ColorSectionArray = [
            {value:0, left:0, color:[255, 0, 0, 1]},
        ]
        let layerobj = {index:index, value:this.LightingEffectData[0].value, enable:true, ColorSectionArray:this.ColorSectionArray, opacityvalue: this.opacityvalue, speedvalue:this.speedvalue, bandwidthvalue:this.bandwidthvalue, anglevalue:this.anglevalue, gapvalue:this.gapvalue, numbervalue:this.numbervalue, firevalue:this.firevalue, amplitudevalue:this.amplitudevalue, gradientvalue:this.gradientvalue, directionvalue:this.directionvalue, fadvalue:this.fadvalue, bidirectionalvalue:this.bidirectionalvalue, separatevalue:this.separatevalue, bumpvalue:this.bumpvalue, center:{x:0, y:0}, Device:_.cloneDeep(this.apModeData.Device)}
        this.apModeData.layerlist.push(layerobj);
        // this.dbService.updateApMode(this.apModeData).then(() => {this.save();})
        this.apModeData.index = index;
        this.createLayer(index, this.LightingEffectData[0].value, 1, 1);
    }

    /**
     * 
     * @param index layer index
     * @param value effect value
     * @param enable enable value
     * @param flag 0:Not Save DB 1:Save DB 
     */
    createLayer(index, value, enable, flag) {
        let text = "";
        let EffectNameIndex = this.LightingEffectData.findIndex(x => x.value == value);
        if(EffectNameIndex != -1) {
            this.translateService.get(this.LightingEffectData[EffectNameIndex].translate).subscribe((res: string) => {
                text = res;
            });
        }
        let parent = document.getElementById("actionsync-lighting-list");
        let card = this.asyncsyncLightingCard.cloneNode(true);
        card.addEventListener('click',this.selectlayerEvent);
        card.setAttribute("id", "actionsync-layer-temp" + index);
        card.querySelector("#actionsync-lighting-dsc").setAttribute("id", "actionsync-lighting-dsc" + index);
        card.querySelector("#actionsync-lighting-select").addEventListener('click',this.selectlightEvent);
        card.querySelector("#actionsync-lighting-select").setAttribute("id", "actionsync-lighting-select" + index);
        card.querySelector("#actionsync-lighting-show").addEventListener('click',this.clickshowEvent);
        card.querySelector("#actionsync-lighting-show").setAttribute("id", "actionsync-lighting-show" + index);
        parent.appendChild(card);
        document.getElementById("actionsync-lighting-dsc" + index).value = text;
        //show status
        if(enable)
            document.getElementById('actionsync-lighting-show' + index).style.backgroundImage = "url(./image/show.png)"
        else
            document.getElementById('actionsync-lighting-show' + index).style.backgroundImage = "url(./image/unshow.png)"
        if(flag == 1) {
            // this.dbService.updateApMode(this.apModeData).then(() => {this.save();})
            this.save();
        }
    }

    removelayer() {
        let index = this.apModeData.layerlist.findIndex(x => x.index == this.apModeData.index);
        if(this.apModeData.index > 0 && index != -1) {
            var Card = document.getElementById("actionsync-layer-temp" + this.apModeData.index); 
            var parent = Card.parentElement;
            parent.removeChild(Card);
            this.apModeData.layerlist.splice(index, 1)
            this.apModeData.index = 0;
            this.dbService.updateApMode(this.apModeData).then(() => {this.save();})
        }
    }

    clickshow(event) {
        var contentPanelId = $(event.target).attr('id')
        var number = contentPanelId.replace(/[^0-9]/ig,"");
        this.apModeData.index = Number(number);
        let index = this.apModeData.layerlist.findIndex(x => x.index == this.apModeData.index)
        if(index != -1) {
            this.apModeData.layerlist[index].enable = !this.apModeData.layerlist[index].enable;
            if(this.apModeData.layerlist[index].enable)
                document.getElementById('actionsync-lighting-show' + number).style.backgroundImage = "url(./image/show.png)"
            else
                document.getElementById('actionsync-lighting-show' + number).style.backgroundImage = "url(./image/unshow.png)"
            this.dbService.updateApMode(this.apModeData).then(() => {this.save();})
        }
        this.layerselected();
    }

    selectlayer(event) {
        var contentPanelId = $(event.target).attr('id')
        var number = contentPanelId.replace(/[^0-9]/ig,"");
        this.apModeData.index = Number(number);
        this.layerselected();
    }

    selectlight(event) {
        var contentPanelId = $(event.target).attr('id')
        var number = contentPanelId.replace(/[^0-9]/ig,"");
        this.apModeData.index = Number(number);
        this.layerselected();
        this.ActionSyncLightingSelect(event);
    }

    layerselected() {
        for(let i = 0; i < this.apModeData.layerlist.length; i++) {
            document.getElementById("actionsync-layer-temp" + this.apModeData.layerlist[i].index).style.background = "transparent";
            document.getElementById("actionsync-lighting-dsc" + this.apModeData.layerlist[i].index).style.color = "#646464";
        }
        document.getElementById("actionsync-layer-temp" + this.apModeData.index).style.background = "rgb(190,190,190)";
        document.getElementById("actionsync-lighting-dsc" + this.apModeData.index).style.color = "black";
        let layerindex = this.getlayerlistindex()
        if(layerindex != undefined) {
            this.ColorSectionArray = this.apModeData.layerlist[layerindex].ColorSectionArray;
            this.opacityvalue = this.apModeData.layerlist[layerindex].opacityvalue;
            this.speedvalue = this.apModeData.layerlist[layerindex].speedvalue;
            this.bandwidthvalue = this.apModeData.layerlist[layerindex].bandwidthvalue;
            this.anglevalue = this.apModeData.layerlist[layerindex].anglevalue;
            this.gapvalue = this.apModeData.layerlist[layerindex].gapvalue;
            this.numbervalue = this.apModeData.layerlist[layerindex].numbervalue;
            this.firevalue = this.apModeData.layerlist[layerindex].firevalue;
            this.amplitudevalue = this.apModeData.layerlist[layerindex].amplitudevalue;
            this.gradientvalue = this.apModeData.layerlist[layerindex].gradientvalue;
            this.directionvalue = this.apModeData.layerlist[layerindex].directionvalue;
            this.fadvalue = this.apModeData.layerlist[layerindex].fadvalue;
            this.bidirectionalvalue = this.apModeData.layerlist[layerindex].bidirectionalvalue;
            this.separatevalue = this.apModeData.layerlist[layerindex].separatevalue;
            this.bumpvalue = this.apModeData.layerlist[layerindex].bumpvalue;
            this.updateColorSection.emit(this.ColorSectionArray)
        }
        // this.updateColorSectionArray();
    }

    /**
     * 開啟或關閉device的pointer event
     * @param flag 
     */
    enableDeviceDrag(flag) {
        if(flag) {
            for(let i = 0; i < this.apModeData.Device.length; i++) 
                document.getElementById(`${this.apModeData.Device[i].SN}`).style.pointerEvents = "auto";
        } else {
            for(let i = 0; i < this.apModeData.Device.length; i++) 
            document.getElementById(`${this.apModeData.Device[i].SN}`).style.pointerEvents = "none";
            // this.save();
        }
    }

    enableLightingCenterDrag(flag) {
        if(flag)
            document.getElementById('lighting-center').style.display = 'block';
        else {
            document.getElementById('lighting-center').style.display = 'none';
            // this.save();
        }
    }

    /**
     * 
     * @param flag 0:清掉全部資料 1:硬體排列 2:框選 3:效果中心
     */
    actionSyncDeviceFunc(flag) {
        if(flag != 0) {
            // this.actionSyncDevicFlag = flag;
            for(let i = 1; i <= 3; i++) 
                document.getElementById('actionSyncDevice' + i).style.backgroundColor = "black";
            if(this.actionSyncDevicFlag != flag) {
                this.actionSyncDevicFlag = flag;
                document.getElementById('actionSyncDevice' + flag).style.backgroundColor = "gray";
                document.getElementById("actionsync-down").addEventListener('click', this.checkActionSyncDeviceFlag.bind(this));
            }
            switch(flag) {
                case 1:
                    this.deviceframeselectflag = false;
                    this.lightingcenterdragflag = false;
                    this.frameSelectionEvent.emit(false);
                    this.devicedragflag = !this.devicedragflag;
                    this.enableLightingCenterDrag(false);
                    this.enableDeviceDrag(this.devicedragflag);
                    // if(this.devicedragflag) 
                    //     this.enableDeviceDrag(true);
                    // else
                    //     this.enableDeviceDrag(false);
                    break;
                case 2:
                    this.devicedragflag = false;
                    this.lightingcenterdragflag = false;
                    this.enableDeviceDrag(false);
                    this.deviceframeselectflag = !this.deviceframeselectflag;
                    this.enableLightingCenterDrag(false);
                    this.frameSelectionEvent.emit( this.deviceframeselectflag);
                    break;
                case 3:
                    this.devicedragflag = false;
                    this.lightingcenterdragflag = false;
                    this.deviceframeselectflag = false
                    this.frameSelectionEvent.emit(false);
                    this.enableDeviceDrag(false);
                    this.lightingcenterdragflag = !this.lightingcenterdragflag;
                    this.enableLightingCenterDrag(this.lightingcenterdragflag)
                    // if(this.lightingcenterdragflag) 
                    //     this.enableLightingCenterDrag(true);
                    // else
                    //     this.enableLightingCenterDrag(false);
                    break;
            }
        } else {
            /**need to do */
            // this.save();
            this.devicedragflag = false;
            this.deviceframeselectflag = false;
            this.lightingcenterdragflag = false;
            this.frameSelectionEvent.emit(false);
            this.enableDeviceDrag(false);
            this.enableLightingCenterDrag(false);
        }
    }

    retrunCurrentLightingLayer() {
        let index = this.apModeData.layerlist.findIndex(x => x.index == this.apModeData.index)
        if(index != -1)
            return this.apModeData.layerlist[index].value;
        else
            return undefined;
    }

    /**
     * 回傳apModeData當前的index
     */
    getlayerlistindex() {
        let index = this.apModeData.layerlist.findIndex(x => x.index == this.apModeData.index)
        if(index != -1)
            return index;
        else
            return undefined;
    }

    /**
     * 
     * @param value 0:Static 1:Wave 2:Conicband 3:Spiral 4:Color Cycle 5:Linearwave 6:Ripple 7:Breath 8:Rain 9:Fire 10:Reactive 11:Audio
     */
    setightParamToDefault(value) { 
        switch(value) {
            case 0:
                this.ColorSectionArray = [
                    {value:0, left:0, color:[255, 0, 0, 1]},
                ]
                break;
            case 1:
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
                this.speedvalue = 5;
                this.bandwidthvalue = 200;
                this.anglevalue = 0;
                this.gradientvalue = true;
                break;
            case 2:
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
                this.speedvalue = 5;
                this.bandwidthvalue = 100;
                this.gradientvalue = true;
                this.directionvalue = false;
                break;
            case 3:
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
                this.speedvalue = 5;
                this.gradientvalue = true;
                this.directionvalue = false;
                break;
            case 4:
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
                this.speedvalue = 2;
                this.gradientvalue = true;
                break;
            case 5:
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
                this.speedvalue = 10;
                this.bandwidthvalue = 50;
                this.anglevalue = 0;
                this.gapvalue = 428;
                this.bumpvalue = false;
                this.gradientvalue = true;
                this.fadvalue = true;
                this.bidirectionalvalue = false;
                break;
            case 6:
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
                this.speedvalue = 10;
                this.bandwidthvalue = 50;
                this.gapvalue = 0;
                this.gradientvalue = true;
                this.fadvalue = true;
                break;
            case 7:
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
                this.speedvalue = 2;
                this.bandwidthvalue = 500;
                this.gapvalue = 100;
                this.gradientvalue = false;
                this.fadvalue = true;
                break;
            case 8:
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
                this.speedvalue = 8
                this.anglevalue = 0;
                this.numbervalue = 5;
                break;
            case 9:
                this.ColorSectionArray = []
                this.speedvalue = 1;
                this.firevalue = 5;
                break;
            case 10:
                this.ColorSectionArray = [
                    {value:0, left:0, color:[255, 0, 0, 1]},
                    {value:1, left:39, color:[255, 255, 255, 1]},
                    {value:2, left:95, color:[255, 255, 0, 1]},
                    {value:3, left:151, color:[0, 128, 0, 1]},
                    {value:4, left:207, color:[106, 255, 249, 1]},
                    {value:5, left:263, color:[0, 0, 255, 1]},
                    {value:6, left:319, color:[75, 0, 130, 1]},
                    {value:7, left:343, color:[238, 130, 238, 1]}
                ]
                this.separatevalue = false;
                this.gradientvalue = false;
                this.fadvalue = true;
                break;
            case 11:
                this.ColorSectionArray = [
                    {value:0, left:0, color:[255, 0, 0, 1]},
                ]
                this.amplitudevalue = 500;
                break;
        }
        this.updateColorSection.emit(this.ColorSectionArray);
    }

    /**
     * 當硬體排列 框選 效果中心被點選時,註冊通知並點選其他地方時會執行取消選取的功能
     * @param event
     */
    checkActionSyncDeviceFlag(event) {
        if(this.actionSyncDevicFlag && event.target.id.indexOf('actionSyncDevice') == -1) {
            this.actionSyncDevicFlag = 0;
            this.actionSyncDeviceFunc(0);
            for(let i = 1; i <= 3; i++)
                document.getElementById('actionSyncDevice' + i).style.backgroundColor = "black";
        }
        document.getElementById("actionsync-down").removeEventListener('click', this.checkActionSyncDeviceFlag.bind(this))
    }

    /**
     * Color picker顏色改變
     * @param event 
     */
    ColorChange(event) {
        document.getElementById('colorbox').style.backgroundColor = `rgb(${event.R}, ${event.G}, ${event.B}, ${event.A/100})`
        let layerindex = this.getlayerlistindex()
        if(this.dotindex == -1 && layerindex != -1 && this.apModeData.layerlist[layerindex].value == 0) //static
            this.dotindex = 0
        if(this.dotindex != -1){
            let index = this.ColorSectionArray.findIndex(x => x.value == this.dotindex);
            if(index != -1) {
                this.ColorSectionArray[index].color = [event.R, event.G, event.B, event.A/100];
                this.updateColorSection.emit(this.ColorSectionArray);
                this.updateColorSectionArray();
            }
        }
    }

    updateColorSectionArray() {
        let layerindex = this.getlayerlistindex()
        if(layerindex != undefined) {
            this.apModeData.layerlist[layerindex].ColorSectionArray = this.ColorSectionArray;
            // this.dbService.updateApMode(this.apModeData).then(() => {})
            this.save();
        }
    }

    /**
     * color section改變
     */
    ColorSectionChange(event) {
        this.ColorSectionArray = event.Array;
        this.dotindex = event.dotindex
        this.updateColorSectionArray();
    }

    addColor() {
        let value = Math.max.apply(Math, this.ColorSectionArray.map(function(o) {return o.value}))
        this.addColorSection.emit(value);
    }

    removeColor() {
        if(this.dotindex != -1) {
            let index = this.ColorSectionArray.findIndex(x => x.value == this.dotindex)
            if(index != -1) {
                this.ColorSectionArray.splice(index, 1);
                let data = this.dotindex;
                this.removeColorSection.emit(data);
                this.dotindex = -1;
                this.dbService.updateApMode(this.apModeData).then(() => {})
            } 
        }
    }
}