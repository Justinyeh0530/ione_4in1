import { Injectable, EventEmitter } from '@angular/core';
let electron_Instance = window['System']._nodeRequire('electron').remote; 
import { TranslateService, LangChangeEvent } from 'ng2-translate';
import { CommonService } from './index'
import * as _ from 'lodash'
import { from } from 'rxjs/observable/from';

@Injectable()
export class ActionSyncService{
    lightinglistdialogflag:boolean = false;
    dbService = electron_Instance.getGlobal('AppProtocol').deviceService.nedbObj;
    opacityvalue: number = 0.5;
    speedvalue: number = 5;
    bandwidthvalue: number = 450;
    anglevalue:number = 0;
    gapvalue:number = 0;
    bumpvalue:number = 0;
    randomspeedvalue:number = 0;
    numbervalue:number = 5;
    firevalue:number = 0.5;
    taketimesvalue:number = 1;
    amplitudevalue:number = 500;
    decayvalue:number = 80;
    gradientvalue:boolean = true;
    softvalue:boolean = true;
    fixedvalue:boolean = false;
    bidirectionalvalue:boolean = true;
    separatevalue:boolean = false;
    LightingEffectData = [
        { name: 'Wave', value: 0, translate: 'Wave'},
        { name: 'ConicBand', value: 1, translate: 'ConicBand'},
        { name: 'Spiral', value: 2, translate: 'Spiral'},
        { name: 'Cycle', value: 3, translate: 'Cycle'},
        { name: 'LinearWave', value: 4, translate: 'LinearWave'},
        { name: 'Ripple', value: 5, translate: 'Ripple'},
        { name: 'Breathing', value: 6, translate: 'Breathing'},
        { name: 'Rain', value: 7, translate: 'Rain'},
        { name: 'Fire', value: 8, translate: 'Fire'},
        { name: 'Trigger', value: 9, translate: 'Trigger'},
        { name: 'AudioCap', value: 10, translate: 'AudioCap'},
    ];
    asyncsyncLightingCard:any;
    lightlayerlist = {layerlist:[], index:0};
    

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

    selectActionSyncLighting(index) {
        console.log(2222,index)
        this.translateService.get(this.LightingEffectData[index].translate).subscribe((res: string) => {
            document.getElementById("actionsync-lighting-dsc" + this.lightlayerlist.index).value = res;
            let layerindex = this.lightlayerlist.layerlist.findIndex(x => x.index == this.lightlayerlist.index);
            if(layerindex != -1) {
                this.lightlayerlist.layerlist[layerindex].value = index;
                this.dbService.updateApMode(this.lightlayerlist).then(() => {this.save();});
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
        let layerobj = {index:index, value:this.LightingEffectData[0].value, enable:true}
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
    }
}