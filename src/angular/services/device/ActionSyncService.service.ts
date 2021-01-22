import { Injectable, EventEmitter, ViewChild } from '@angular/core';
let electron_Instance = window['System']._nodeRequire('electron').remote; 
import { TranslateService, LangChangeEvent } from 'ng2-translate';
import { CommonService } from './index';
import * as _ from 'lodash'
import { xor } from 'lodash';

@Injectable()
export class ActionSyncService{
    updateColorSection: EventEmitter<object> = new EventEmitter();
    removeColorSection: EventEmitter<number> = new EventEmitter();
    addColorSection: EventEmitter<number> = new EventEmitter();
    lightinglistdialogflag:boolean = false;
    dbService = electron_Instance.getGlobal('AppProtocol').deviceService.nedbObj;
    opacityvalue: number = 50;
    speedvalue: number = 5;
    bandwidthvalue: number = 450;
    anglevalue:number = 0;
    gapvalue:number = 0;
    numbervalue:number = 5;
    firevalue:number = 0.5;
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
    actionSyncDevicFlag:boolean = false;
    lightlayerlist = {layerlist:[], index:0};

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

    //event
    clickshowEvent:any;
    selectlayerEvent:any;
    selectlightEvent:any;

    constructor(
        private translateService: TranslateService,
        private commonService: CommonService
    ){
        document.addEventListener('click',(event) => {
            if(this.lightinglistdialogflag && event.target.id.indexOf('actionsync-lighting-select') == -1) {
                document.getElementById('actionsync-lightinglist').style.display = 'none';
                this.lightinglistdialogflag = false;
            }
        })
    }

    InitData() {
        let card = document.getElementById('actionsync-layer-temp');
        this.asyncsyncLightingCard = card.cloneNode(true);
        card.style.display = "none";
        this.clickshowEvent = this.clickshow.bind(this);
        this.selectlayerEvent = this.selectlayer.bind(this);
        this.selectlightEvent = this.selectlight.bind(this);
        this.dbService.getApMode().then((data) => {
            if(data.layerlist.length > 0)
                this.lightlayerlist = _.cloneDeep(data);
            for(let i = 0; i < this.lightlayerlist.layerlist.length; i++) {
                this.createLayer(this.lightlayerlist.layerlist[i].index, this.lightlayerlist.layerlist[i].value, this.lightlayerlist.layerlist[i].enable, 0)
            }
            if(this.lightlayerlist.index != 0) {
                document.getElementById("actionsync-layer-temp" + this.lightlayerlist.index).style.background = "white";
                document.getElementById("actionsync-lighting-dsc" + this.lightlayerlist.index).style.color = "black";
                let layerindex = this.getlayerlistindex()
                if(layerindex != undefined) {
                    this.ColorSectionArray = this.lightlayerlist.layerlist[layerindex].ColorSectionArray;
                    this.updateColorSection.emit(this.ColorSectionArray)
                }
            }
        })
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
            document.getElementById("actionsync-lighting-dsc" + this.lightlayerlist.index).value = res;
            let layerindex = this.lightlayerlist.layerlist.findIndex(x => x.index == this.lightlayerlist.index);
            if(layerindex != -1) {
                this.lightlayerlist.layerlist[layerindex].value = index;
                this.setightParamToDefault(index);
                this.updateColorSectionArray();
            }
        })
    }

    save() {
        this.commonService.delayDialog('main-app',500)
    }

    addlayer() {
        let index = 0;
        if(this.lightlayerlist.layerlist.length > 0) 
            index = this.lightlayerlist.layerlist[this.lightlayerlist.layerlist.length - 1].index;
        index++;
        this.createLayer(index, this.LightingEffectData[0].value, 1, 1);
        this.ColorSectionArray = [
            {value:0, left:0, color:[255, 0, 0, 1]},
        ]
        let layerobj = {index:index, value:this.LightingEffectData[0].value, enable:true, ColorSectionArray:this.ColorSectionArray}
        this.lightlayerlist.layerlist.push(layerobj);
        this.dbService.updateApMode(this.lightlayerlist).then(() => {this.save();})
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
            this.dbService.updateApMode(this.lightlayerlist).then(() => {this.save();})
        }
    }

    removelayer() {
        let index = this.lightlayerlist.layerlist.findIndex(x => x.index == this.lightlayerlist.index);
        if(this.lightlayerlist.index > 0 && index != -1) {
            var Card = document.getElementById("actionsync-layer-temp" + this.lightlayerlist.index); 
            var parent = Card.parentElement;
            parent.removeChild(Card);
            this.lightlayerlist.layerlist.splice(index, 1)
            this.lightlayerlist.index = 0;
            this.dbService.updateApMode(this.lightlayerlist).then(() => {this.save();})
        }
    }

    clickshow(event) {
        var contentPanelId = $(event.target).attr('id')
        var number = contentPanelId.replace(/[^0-9]/ig,"");
        this.lightlayerlist.index = Number(number);
        let index = this.lightlayerlist.layerlist.findIndex(x => x.index == this.lightlayerlist.index)
        if(index != -1) {
            this.lightlayerlist.layerlist[index].enable = !this.lightlayerlist.layerlist[index].enable;
            if(this.lightlayerlist.layerlist[index].enable)
                document.getElementById('actionsync-lighting-show' + number).style.backgroundImage = "url(./image/show.png)"
            else
                document.getElementById('actionsync-lighting-show' + number).style.backgroundImage = "url(./image/unshow.png)"
            this.dbService.updateApMode(this.lightlayerlist).then(() => {this.save();})
        }
        this.layerselected();
    }

    selectlayer(event) {
        var contentPanelId = $(event.target).attr('id')
        var number = contentPanelId.replace(/[^0-9]/ig,"");
        this.lightlayerlist.index = Number(number);
        this.layerselected();
    }

    selectlight(event) {
        var contentPanelId = $(event.target).attr('id')
        var number = contentPanelId.replace(/[^0-9]/ig,"");
        this.lightlayerlist.index = Number(number);
        this.layerselected();
        this.ActionSyncLightingSelect(event);
    }

    layerselected() {
        for(let i = 0; i < this.lightlayerlist.layerlist.length; i++) {
            document.getElementById("actionsync-layer-temp" + this.lightlayerlist.layerlist[i].index).style.background = "transparent";
            document.getElementById("actionsync-lighting-dsc" + this.lightlayerlist.layerlist[i].index).style.color = "#646464";
        }
        document.getElementById("actionsync-layer-temp" + this.lightlayerlist.index).style.background = "rgb(190,190,190)";
        document.getElementById("actionsync-lighting-dsc" + this.lightlayerlist.index).style.color = "black";
        let layerindex = this.getlayerlistindex()
        if(layerindex != undefined) {
            this.ColorSectionArray = this.lightlayerlist.layerlist[layerindex].ColorSectionArray;
            this.updateColorSection.emit(this.ColorSectionArray)
        }
        // this.updateColorSectionArray();
    }

    /**
     * 
     * @param flag 0:清掉全部資料 1:硬體排列 2:框選 3:效果中心
     */
    actionSyncDeviceFunc(flag) {
        if(flag != 0) {
            this.actionSyncDevicFlag = true;
            for(let i = 1; i <= 3; i++) 
                document.getElementById('actionSyncDevice' + i).style.backgroundColor = "black";
            document.getElementById('actionSyncDevice' + flag).style.backgroundColor = "gray";
            document.getElementById("actionsync-down").addEventListener('click', this.checkActionSyncDeviceFlag.bind(this))
        } else {
            /**need to do */
        }
    }

    retrunCurrentLightingLayer() {
        let index = this.lightlayerlist.layerlist.findIndex(x => x.index == this.lightlayerlist.index)
        if(index != -1)
            return this.lightlayerlist.layerlist[index].value;
        else
            return undefined;
    }

    /**
     * 回傳lightlayerlist當前的index
     */
    getlayerlistindex() {
        let index = this.lightlayerlist.layerlist.findIndex(x => x.index == this.lightlayerlist.index)
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
                this.gapvalue = 0;
                this.bumpvalue = false;
                this.gradientvalue = true;
                this.fadvalue = true;
                this.bidirectionalvalue = true;
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
            this.actionSyncDevicFlag = false;
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
            this.lightlayerlist.layerlist[layerindex].ColorSectionArray = this.ColorSectionArray;
            this.dbService.updateApMode(this.lightlayerlist).then(() => {})
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
                this.dbService.updateApMode(this.lightlayerlist).then(() => {})
            } 
        }
    }
}