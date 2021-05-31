declare var System;
import { Component, OnInit, Output, Input, EventEmitter, SimpleChange, OnChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ElectronEventService } from '../../../services/libs/electron/index';
import { protocolService } from '../../../services/service/protocol.service';
import { TranslateService, LangChangeEvent } from 'ng2-translate';
let evtVar = System._nodeRequire('./backend/others/EventVariable');
let funcVar = System._nodeRequire('./backend/others/FunctionVariable');
let env = System._nodeRequire('./backend/others/env');
import { DeviceService, GetAppService, CommonService, FunctionService, HeadsetFunctionService, ActionSyncService} from '../../../services/device/index';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { EmitService } from '../../../services/libs/electron/index'
let remote = System._nodeRequire('electron').remote;
let win = remote.getGlobal('MainWindow').win;
let SupportLanguage = System._nodeRequire('./backend/others/SupportData').SupportLanguage;
let electron_Instance = window['System']._nodeRequire('electron').remote; 
const { ipcRenderer } = System._nodeRequire('electron');

@Component({
    selector: 'app-actionsync',
    templateUrl: './components/layout/actionsync/actionsync.component.html',
    styleUrls: ['./components/layout/actionsync/actionsync.component.css'],
    providers: [protocolService]
})

export class ActionSyncComponent implements OnInit {
    dbService = electron_Instance.getGlobal('AppProtocol').deviceService.nedbObj;
    checkActionSyncDeviceFlagEvent:any;
    colorpickerFlag:boolean = false;
    StartPosx:number = 0;
    StartPosy:number = 0;
    DeviceX:number = 0;
    DeviceY:number = 0;
    LightingCenterX:number = 0;
    LightingCenterY:number = 0;
    devicedrag: boolean = false;
    lightingcenterdrag: boolean = false;
    dragDeviceID:any = "";
    framesubscribe:any;
    topbarsubscribe:any;
    Syncsubscription:any;

    //選擇框
    SelectDiv:any;
    StartLeft:any;
    StartTop:any;
    selectflag:boolean = false;
    selectArray:any = [];

    constructor(
        private protocol: protocolService,
        private translate: TranslateService,
        private dialog: MdDialog,
        private deviceService: DeviceService,
        private getAppService: GetAppService,
        private router: Router,
        private commonService: CommonService,
        private cdr: ChangeDetectorRef, 
        private functionService: FunctionService,
        private headsetFunctionService: HeadsetFunctionService,
        private emitService: EmitService,
        private actionSyncService: ActionSyncService
    ) {
        this.framesubscribe = this.actionSyncService.frameSelectionEvent.subscribe((flag) => {
            //打開框選
            if(flag) {
                // this.actionSyncService.apModeData.Device.forEach((element) => {
                //     element.led.forEach((item, index) => {
                //         console.log(`${element.SN}-led${index}`,item)
                //         if(item == 1)
                //             document.getElementById(`${element.SN}-led${index}`).style.borderColor = 'yellow';
                //         else
                //             document.getElementById(`${element.SN}-led${index}`).style.borderColor = 'black';
                //     });
                // })
                console.log('開啟框選')
                this.refreshSelectLightingStatus();
            //關閉框選
            } else {
                console.log('關閉框選')
                // this.actionSyncService.apModeData.Device.forEach((element) => {
                //     element.led.forEach((item, index) => {
                //         document.getElementById(`${element.SN}-led${index}`).style.borderColor = 'black';
                //     });
                // })
                let layerindex = this.actionSyncService.getlayerlistindex()
                if(layerindex != undefined) {
                    this.actionSyncService.apModeData.layerlist[layerindex].Device.forEach((element) => {
                        element.led.forEach((item, index) => {
                            document.getElementById(`${element.SN}-led${index}`).style.borderColor = 'black';
                        });
                    })
                }
            }
        })

        this.topbarsubscribe = this.functionService.changeTopbarEvent.subscribe(() => {
            this.actionSyncService.resetflag();
        })

        this.Syncsubscription = this.emitService.EmitObservable.subscribe((src:any) => {
            if(src.Func == 'SendSyncLED') {
                // console.log(2222,src.Data[0])
                //A08s
                for(let i = 0; i < src.Data[0].length; i++) {
                    if(document.getElementById(`0x195D0xA005-led${i}`))
                        document.getElementById(`0x195D0xA005-led${i}`).style.backgroundColor="rgb("+src.Data[0][i][0]+","+src.Data[0][i][1]+","+src.Data[0][i][2]+")";
                }
            }
        });
    }

    ngOnInit() {
        this.checkActionSyncDeviceFlagEvent = this.checkActionSyncDeviceFlag.bind(this);
        // document.getElementById("actionsync-down").addEventListener('click', this.checkActionSyncDeviceFlagEvent)
        document.getElementById("action-sync-desktop").addEventListener('mousedown', this.mousedown.bind(this));
        document.getElementById("action-sync-desktop").addEventListener('mousemove', this.mousemove.bind(this));
        document.getElementById("action-sync-desktop").addEventListener('mouseup', this.mouseup.bind(this));
        this.actionSyncService.StartApMode();
    }

    ngOnDestroy() {
        // document.getElementById("actionsync-down").removeEventListener('click', this.checkActionSyncDeviceFlagEvent)
        // document.getElementById("action-sync-desktop").removeEventListener('mousedown', this.mousedown.bind(this));
        // document.getElementById("action-sync-desktop").removeEventListener('mousemove', this.mousemove.bind(this));
        // document.getElementById("action-sync-desktop").removeEventListener('mouseup', this.mouseup.bind(this));
        this.framesubscribe.unsubscribe();
        this.topbarsubscribe.unsubscribe();
        this.Syncsubscription.unsubscribe();
    }

    SliderMove(id) {

    }

    SliderChange(id) {
        this.actionSyncService.save();
    }

    checkbox(value) {
        this.actionSyncService[value] = !this.actionSyncService[value];
        this.actionSyncService.save();
    }

    checkActionSyncDeviceFlag(event) {
        if(this.actionSyncService.actionSyncDevicFlag && event.target.id.indexOf('actionSyncDevice') == -1) {
            this.actionSyncService.actionSyncDevicFlag = 0;
            this.actionSyncService.actionSyncDeviceFunc(0);
            for(let i = 1; i <= 3; i++)
                document.getElementById('actionSyncDevice' + i).style.backgroundColor = "black";
        }
    }

    openColorPicker() {
        this.colorpickerFlag = !this.colorpickerFlag;
    }

    /**
     * 放大
     */
    Zoomin() {
        this.actionSyncService.zoomvalue = this.actionSyncService.zoomvalue + 1;
        if(this.actionSyncService.zoomvalue > 10)
            this.actionSyncService.zoomvalue = 10;
        document.getElementById('action-sync-desktop').style.transform = `scale(${this.actionSyncService.zoomvalue / 10})`;
    }

    /**
     * 縮小
     */
    Zoomout() {
        this.actionSyncService.zoomvalue = this.actionSyncService.zoomvalue - 1;
        if(this.actionSyncService.zoomvalue <= 4)
            this.actionSyncService.zoomvalue = 4;
        document.getElementById('action-sync-desktop').style.transform = `scale(${this.actionSyncService.zoomvalue / 10})`;
    }

    mousedown(event) {
        let index = this.actionSyncService.apModeData.Device.findIndex(x => x.SN == event.target.id);
        console.log('down',event.target.id,event)
        if(this.actionSyncService.devicedragflag && index != -1) {
            let index = this.actionSyncService.apModeData.Device.findIndex(x => x.SN == event.target.id)
            if(index != -1) {
                this.dragDeviceID = event.target.id;
                this.devicedrag = true;
                this.DeviceX = event.srcElement.offsetLeft;
                this.DeviceY = event.srcElement.offsetTop;
                for(let i = 0; i < this.actionSyncService.apModeData.Device.length; i++)
                    document.getElementById(`${this.actionSyncService.apModeData.Device[i].SN}`).style.pointerEvents ='none';
            }
        } else if(this.actionSyncService.deviceframeselectflag) {
            this.selectflag = true;
            if(document.getElementById('tempDiv'))
                document.getElementById('action-sync-desktop').removeChild(this.SelectDiv);
            this.SelectDiv = document.createElement("div");
            this.SelectDiv.className = "tempDiv";
            this.SelectDiv.setAttribute("id","tempDiv")
            this.SelectDiv.style.border = "2px dashed red";
            this.SelectDiv.style.background = "transparent";
            this.SelectDiv.style.position = "absolute";
            // this.SelectDiv.style.position = "relative";
            this.SelectDiv.style.zIndex = "99";
            this.SelectDiv.style.opticityvalue = "0.1";
            this.SelectDiv.style.left = event.offsetX + "px";
            this.SelectDiv.style.top = event.offsetY + "px";
            document.getElementById('action-sync-desktop').appendChild(this.SelectDiv);
        } else if(this.actionSyncService.lightingcenterdragflag && event.target.id == 'lighting-center') {
            this.lightingcenterdrag = true;
            this.LightingCenterX = event.srcElement.offsetLeft;
            this.LightingCenterY = event.srcElement.offsetTop;
        }
        this.StartPosx = event.clientX;
        this.StartPosy = event.clientY;
        this.StartLeft = this.SelectDiv.style.left.split('px')[0];
        this.StartTop = this.SelectDiv.style.top.split('px')[0];

    }

    mousemove(event) {
        let scale = this.actionSyncService.zoomvalue / 10;
        let TempX, TempY, TempWidth, TempHeight, check = false;
        if(this.devicedrag) {
            console.log(`move X:${event.clientX} Y:${event.clientY} DeviceX:${this.DeviceX} DeviceY:${this.DeviceY}`)
            let moveX = (event.clientX - this.StartPosx) / scale;
            let moveY = (event.clientY - this.StartPosy) / scale;
            document.getElementById(this.dragDeviceID).style.left = `${this.DeviceX + moveX}px`;
            document.getElementById(this.dragDeviceID).style.top = `${this.DeviceY + moveY}px`;
            let index = this.actionSyncService.apModeData.Device.findIndex(x => x.SN == this.dragDeviceID);
            if(index != -1) {
                this.actionSyncService.apModeData.Device[index].x = this.DeviceX + moveX;
                this.actionSyncService.apModeData.Device[index].y = this.DeviceY + moveY;
            }
        } else if(this.actionSyncService.deviceframeselectflag && this.SelectDiv && this.selectflag) {
            this.selectArray = [];
            if(event.clientX < this.StartPosx )
                this.SelectDiv.style.left = this.StartLeft - Math.abs(this.StartPosx - event.clientX) / scale + 'px';
            if(event.clientY < this.StartPosy) 
                this.SelectDiv.style.top = this.StartTop - Math.abs(this.StartPosy - event.clientY) / scale + 'px';

            this.SelectDiv.style.width = Math.abs(this.StartPosx - event.clientX) / scale+"px";
            this.SelectDiv.style.height = Math.abs(this.StartPosy - event.clientY) / scale +"px";

            var SelectDivY = this.SelectDiv.offsetTop; 
            var SelectDivHeight = this.SelectDiv.offsetTop + this.SelectDiv.offsetHeight;
            var SelectDivX = this.SelectDiv.offsetLeft;
            var SelectDivYWidth = this.SelectDiv.offsetLeft + this.SelectDiv.offsetWidth;

            // this.actionSyncService.apModeData.Device.forEach((element, deviceindex) => {
            //     if(element.SN == "0x195D0xA005") {
            //         let DivOffset = document.getElementById(element.SN);
            //         element.led.forEach((item, index) => {
            //             check = false;
            //             TempX = Number(document.getElementById(`${element.SN}-led${index}`).style.left.split('px')[0]) + Number(DivOffset.style.left.split('px')[0])
            //             TempWidth = TempX + 20;
            //             TempY = Number(document.getElementById(`${element.SN}-led${index}`).style.top.split('px')[0]) + Number(DivOffset.style.top.split('px')[0])
            //             TempHeight =  TempY + 20;
            //             //沒有框選到
            //             if((SelectDivYWidth < TempX) || (SelectDivX > TempWidth) || (SelectDivHeight < TempY) || (SelectDivY > TempHeight)) {
            //                 check = true;
            //                 console.log(`沒有框選到:${element.SN}-led${index}`)
            //             }
            //             if(!check) {
            //                 let obj = {
            //                     deviceIndex: deviceindex,
            //                     ledIndex: index
            //                 }
            //                 this.selectArray.push(obj)
            //             }
            //         });
            //     }
            // });
            let layerindex = this.actionSyncService.getlayerlistindex()
            if(layerindex != undefined) {
                this.actionSyncService.apModeData.layerlist[layerindex].Device.forEach((element, deviceindex) => {
                    if(element.SN == "0x195D0xA005") {
                        let DivOffset = document.getElementById(element.SN);
                        element.led.forEach((item, index) => {
                            check = false;
                            TempX = Number(document.getElementById(`${element.SN}-led${index}`).style.left.split('px')[0]) + Number(DivOffset.style.left.split('px')[0])
                            TempWidth = TempX + 20;
                            TempY = Number(document.getElementById(`${element.SN}-led${index}`).style.top.split('px')[0]) + Number(DivOffset.style.top.split('px')[0])
                            TempHeight =  TempY + 20;
                            //沒有框選到
                            if((SelectDivYWidth < TempX) || (SelectDivX > TempWidth) || (SelectDivHeight < TempY) || (SelectDivY > TempHeight)) {
                                check = true;
                                console.log(`沒有框選到:${element.SN}-led${index}`)
                            }
                            if(!check) {
                                let obj = {
                                    deviceIndex: deviceindex,
                                    ledIndex: index
                                }
                                this.selectArray.push(obj)
                            }
                        });
                    }
                })
            }
        } else if(this.lightingcenterdrag) {
            let moveX = (event.clientX - this.StartPosx) / scale;
            let moveY = (event.clientY - this.StartPosy) / scale;
            document.getElementById('lighting-center').style.left = `${this.LightingCenterX + moveX}px`;
            document.getElementById('lighting-center').style.top = `${this.LightingCenterY + moveY}px`;
            
            // this.actionSyncService.apModeData.center.x = this.LightingCenterX + moveX;
            // this.actionSyncService.apModeData.center.y = this.LightingCenterY + moveY;
            let layerindex = this.actionSyncService.getlayerlistindex()
            if(layerindex != undefined) {
                this.actionSyncService.apModeData.layerlist[layerindex].center.x = this.LightingCenterX + moveX;
                this.actionSyncService.apModeData.layerlist[layerindex].center.y = this.LightingCenterY + moveY;
            }
        }
    }

    mouseup(event) {
        if(this.devicedrag) {
            this.devicedrag = false;
            for(let i = 0; i < this.actionSyncService.apModeData.Device.length; i++)
                document.getElementById(`${this.actionSyncService.apModeData.Device[i].SN}`).style.pointerEvents ='auto';
            // this.dbService.updateApMode(this.actionSyncService.apModeData).then(() => {})
            this.actionSyncService.save();
        } else if(this.actionSyncService.deviceframeselectflag) {
            let result = this.checkSelect()
            this.selectArray.forEach((element,index) => {
                result.forEach((resuleElement) => {
                    // if(element.deviceIndex == resuleElement.deviceIndex && !resuleElement.flag) {
                    //     if(this.actionSyncService.apModeData.Device[element.deviceIndex].led[element.ledIndex] == 0)
                    //         this.actionSyncService.apModeData.Device[element.deviceIndex].led[element.ledIndex] = 1;
                    //     else
                    //         this.actionSyncService.apModeData.Device[element.deviceIndex].led[element.ledIndex] = 0;
                    // } else if(element.deviceIndex == resuleElement.deviceIndex && resuleElement.flag) {
                    //     this.actionSyncService.apModeData.Device[element.deviceIndex].led[element.ledIndex] = 1;
                    // }

                    let layerindex = this.actionSyncService.getlayerlistindex();
                    if(layerindex != undefined) {
                        if(element.deviceIndex == resuleElement.deviceIndex && !resuleElement.flag) {
                            if(this.actionSyncService.apModeData.layerlist[layerindex].Device[element.deviceIndex].led[element.ledIndex] == 0)
                                this.actionSyncService.apModeData.layerlist[layerindex].Device[element.deviceIndex].led[element.ledIndex] = 1;
                            else
                                this.actionSyncService.apModeData.layerlist[layerindex].Device[element.deviceIndex].led[element.ledIndex] = 0
                        } else if(element.deviceIndex == resuleElement.deviceIndex && resuleElement.flag) {
                            this.actionSyncService.apModeData.layerlist[layerindex].Device[element.deviceIndex].led[element.ledIndex] = 1;
                        }
                    }
                });
            })
            this.selectflag = false;
            document.getElementById('action-sync-desktop').removeChild(this.SelectDiv);
            this.refreshSelectLightingStatus();
            // this.dbService.updateApMode(this.actionSyncService.apModeData).then(() => {})
            this.actionSyncService.save();
        } else if(this.lightingcenterdrag) {
            this.lightingcenterdrag = false;
            // this.dbService.updateApMode(this.actionSyncService.apModeData).then(() => {})
            this.actionSyncService.save();
        }
    }

    refreshSelectLightingStatus() {
        let layerindex = this.actionSyncService.getlayerlistindex();
        if(layerindex != undefined) {
            this.actionSyncService.apModeData.layerlist[layerindex].Device.forEach((element) => {
                element.led.forEach((item, index) => {
                    if(item == 1)
                        document.getElementById(`${element.SN}-led${index}`).style.borderColor = 'yellow';
                    else
                        document.getElementById(`${element.SN}-led${index}`).style.borderColor = 'black';
                });
            })
        }
    }

    checkSelect() {
        this.commonService.ArraySort(this.selectArray, 'deviceIndex')
        let result=[], obj={deviceIndex:'', flag:false}, ledvalue;
        let layerindex = this.actionSyncService.getlayerlistindex();
        this.selectArray.forEach((element, index) => {
            if(obj.deviceIndex != '' && obj.deviceIndex != element.deviceIndex) {
                result.push(obj);
                obj.deviceIndex = element.deviceIndex;
                obj.flag = false;
                ledvalue = undefined;
            } else {
                if(obj.deviceIndex == '')
                    obj.deviceIndex = element.deviceIndex;
                if(ledvalue == undefined && layerindex!= undefined)
                    ledvalue = this.actionSyncService.apModeData.layerlist[layerindex].Device[element.deviceIndex].led[element.ledIndex]
                else if(ledvalue != this.actionSyncService.apModeData.layerlist[layerindex].Device[element.deviceIndex].led[element.ledIndex])
                    obj.flag = true;
                if(index == this.selectArray.length - 1)
                    result.push(obj);
            }
        })
        return result;
    }

    checkLightingCenter() {
        let layerindex = this.actionSyncService.getlayerlistindex();
        let obj = {
            x:0,
            y:0
        }
        if(layerindex != undefined) {
            obj.x = this.actionSyncService.apModeData.layerlist[layerindex].center.x;
            obj.y = this.actionSyncService.apModeData.layerlist[layerindex].center.y
        }
        return obj;
    }
}