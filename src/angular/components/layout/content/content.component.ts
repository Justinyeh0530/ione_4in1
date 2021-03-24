declare var System;
import { Component, OnInit, Output, Input, EventEmitter, SimpleChange, OnChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ElectronEventService } from '../../../services/libs/electron/index';
import { protocolService } from '../../../services/service/protocol.service';
import { TranslateService, LangChangeEvent } from 'ng2-translate';
let evtVar = System._nodeRequire('./backend/others/EventVariable');
let funcVar = System._nodeRequire('./backend/others/FunctionVariable');
let env = System._nodeRequire('./backend/others/env');
import { DeviceService, GetAppService, CommonService, FunctionService, HeadsetFunctionService} from '../../../services/device/index';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { Router } from '@angular/router';
let remote = System._nodeRequire('electron').remote;
let win = remote.getGlobal('MainWindow').win;
let SupportLanguage = System._nodeRequire('./backend/others/SupportData').SupportLanguage;
let electron_Instance = window['System']._nodeRequire('electron').remote; 
const { ipcRenderer } = System._nodeRequire('electron');

@Component({
    selector: 'app-content',
    templateUrl: './components/layout/content/content.component.html',
    styleUrls: ['./components/layout/content/content.component.css'],
    providers: [protocolService]
})

export class ContentComponent implements OnInit {

    supportlanguage: any = [];
    languageSelect: any;
    SettingFlag: any;
    Startup: any;
    subscription: any;
    EQsubscription: any;
    UpdateData: any;
    LightingSleep: any;
    SleepValue: number = 5;
    DeviceProfile: any = [];
    deviceProfileSelect: any;
    DeviceCurrentProfile: any;
    Minimize: any;
    WindowSizeFlag: any = false;
    Headsetsubscription:any;

    SleepTimeData: any = [
        { name: "5minutes", value: 5, translate: '5minutes' },
        { name: "10minutes", value: 10, translate: '10minutes' }
    ]

    BatteryDialogCheck: MdDialogRef<any>;

    content_Refresh: EventEmitter<object> = new EventEmitter();
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
        private headsetFunctionService: HeadsetFunctionService
    ) {
        this.commonService.setCurrentPage(0);
        this.subscription = this.deviceService.updateSupportDevice.subscribe((data) => {
        })
        this.Headsetsubscription = this.functionService.updateFuncStatus.subscribe((data) => {
            this.initData();
        })

        this.EQsubscription = this.headsetFunctionService.refreshEQEvent.subscribe((data) => {
            this.EQmove('value31');
            this.EQmove('value62');
            this.EQmove('value125');
            this.EQmove('value250');
            this.EQmove('value500');
            this.EQmove('value1K');
            this.EQmove('value2K');
            this.EQmove('value4K');
            this.EQmove('value8K');
            this.EQmove('value16K');
        });
    }

    initData() {
        if(this.deviceService.currentDevice != undefined && this.deviceService.currentDevice.SN == "0x195D0xA005" && this.functionService.topbarfunc == 1 && this.functionService.headsetleftfunc == 1) {
            this.initEQ();
        } else if(this.deviceService.currentDevice != undefined && this.deviceService.currentDevice.SN == "0x195D0xA005" && this.functionService.topbarfunc == 1 && this.functionService.headsetleftfunc == 2) {
            this.initMic();
        }
    }

    ngOnInit() {
        this.initData();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.EQsubscription.unsubscribe();
    }

    initEQ() {
        setTimeout(() => {
            this.EQmove('value31');
            this.EQmove('value62');
            this.EQmove('value125');
            this.EQmove('value250');
            this.EQmove('value500');
            this.EQmove('value1K');
            this.EQmove('value2K');
            this.EQmove('value4K');
            this.EQmove('value8K');
            this.EQmove('value16K');
        });
    }

    initMic() {
        setTimeout(() => {
            this.SliderMove('MicVolumeBounds');
            this.SliderMove('MicSideTone');
        });
    }

    /**
     * click minimize button
     */
    minimize() {
        var window = remote.BrowserWindow.getFocusedWindow();
        window.minimize();
    }

    /**
     * click maximize button
     */
    maximize() {
        var window = remote.BrowserWindow.getFocusedWindow();
        if (this.WindowSizeFlag) {
            // window.setSize(env.winSettings.width , env.winSettings.height);
            window.unmaximize();
            this.WindowSizeFlag = false;
        } else {
            window.maximize();
            this.WindowSizeFlag = true;
        }
    }

    /**
     * click close button
     */
    close() {
        var window = remote.BrowserWindow.getFocusedWindow();
        window.hide();
    }

    /**
     * 
     * @param flag 1.twitter 2:facebook 3:ig
     */
    Sociallink (flag) {
        let url;
        if(flag == 1)
            url = 'https://twitter.com/'
        else if(flag == 2)
            url = 'https://www.facebook.com'
        else
            url = 'https://www.instagram.com/'
        ipcRenderer.send("customHyper_Link",url);
    }

    SliderMove(id) {
        let range = 0;
        switch(id) {
            case 'MicVolume':
                range = 432;
                break;
            case 'MicVolumeBounds':
                range = 401;
                break;
            case 'MicSideTone':
                range = 406;
                break;
        }
        if(id == 'MicVolumeBounds' && document.getElementById(id)) 
            document.getElementById(id).style.backgroundImage = '-webkit-linear-gradient(left ,#FFFFFF 0%,#FFFFFF ' + this.headsetFunctionService[id+'ValueTemp'] * 10 + '%,#313131 ' + this.headsetFunctionService[id+'ValueTemp'] * 10 + '%, #313131 100%)'
        else if(id== 'MicSideTone' && document.getElementById(id))
            document.getElementById(id).style.backgroundImage = '-webkit-linear-gradient(left ,#FFFFFF 0%,#FFFFFF ' + this.headsetFunctionService[id+'ValueTemp'] * 33 + '%,#313131 ' + this.headsetFunctionService[id+'ValueTemp'] * 33 + '%, #313131 100%)'
    }

    MicChange(param) {
        this.headsetFunctionService.HeadsetMicrophone(param);
    }

    EQChange(param) {
        this.headsetFunctionService.HeadsetEQ(param)
    }

    EqulizereSelect() {
        this.headsetFunctionService.EqulizereSelect();
        this.initEQ();
    }

    EQmove(id) {
        if(document.getElementById(id)) {
            document.getElementById(id).style.backgroundImage = '-webkit-linear-gradient(left ,rgb(190, 190, 190) 0%,rgb(190, 190, 190) ' + this.headsetFunctionService[id] + '%,rgb(40,40,40) ' + this.headsetFunctionService[id] + '%, rgb(40,40,40) 100%)'}
    }

    SliderChangeMove(id) {
        switch(id) {
            case 'Brightness':
                document.getElementById(id).style.backgroundImage = '-webkit-linear-gradient(left ,rgb(190, 190, 190) 0%,rgb(190, 190, 190) ' + this.headsetFunctionService[id+'Value'] * 10 + '%,rgb(40,40,40) ' + this.headsetFunctionService[id+'Value'] * 10 + '%, rgb(40,40,40) 100%)'
                break;
            case 'Speed':
                document.getElementById(id).style.backgroundImage = '-webkit-linear-gradient(left ,rgb(190, 190, 190) 0%,rgb(190, 190, 190) ' + (this.headsetFunctionService[id+'Value'] - 1) * 11 + '%,rgb(40,40,40) ' + (this.headsetFunctionService[id+'Value'] - 1) * 11 + '%, rgb(40,40,40) 100%)'
                break;
            case 'Duration':
                document.getElementById(id).style.backgroundImage = '-webkit-linear-gradient(left ,rgb(190, 190, 190) 0%,rgb(190, 190, 190) ' + (this.headsetFunctionService[id+'Value'] - 1) * 50 + '%,rgb(40,40,40) ' + (this.headsetFunctionService[id+'Value'] - 1) * 50 + '%, rgb(40,40,40) 100%)'
                break;
        }
    }

    syncColorBar() {
        let string = "";
        for(let i = 0; i < this.headsetFunctionService.ColorSectionArray.length; i++) {
            let percentage = (this.headsetFunctionService.ColorSectionArray[i].left + 10) * 100 / 400;
            string = string + `,rgb(${this.headsetFunctionService.ColorSectionArray[i].color[0]},${this.headsetFunctionService.ColorSectionArray[i].color[1]},${this.headsetFunctionService.ColorSectionArray[i].color[2]}, ${this.headsetFunctionService.ColorSectionArray[i].color[3]}) ${percentage}%`
        }
        document.getElementById(`color-bar`).style.background = "linear-gradient(to right" + string + ")";
    }

    clickPattern(id) {
        this.headsetFunctionService.ColorSectionArray = undefined;
        switch(id) {
            case 1:
                this.headsetFunctionService.ColorSectionArray = [
                    {value:0, left:0, color:[255, 0, 0, 1]},
                    {value:1, left:39, color:[255, 165, 0, 1]},
                    {value:2, left:95, color:[255, 255, 0, 1]},
                    {value:3, left:151, color:[0, 128, 0, 1]},
                    {value:4, left:207, color:[106, 255, 249, 1]},
                    {value:5, left:263, color:[0, 0, 255, 1]},
                    {value:6, left:319, color:[75, 0, 130, 1]},
                    {value:7, left:343, color:[238, 130, 238, 1]}
                ]
                break;
            case 2:
                this.headsetFunctionService.ColorSectionArray = [
                    {value:0, left:100, color:[0, 128, 0, 1]},
                    {value:1, left:200, color:[255, 255, 0, 1]},
                    {value:2, left:280, color:[255, 165, 0, 1]},
                    {value:3, left:380, color:[75, 0, 130, 1]},
                ]
                break;
            case 3:
                this.headsetFunctionService.ColorSectionArray = [
                    {value:0, left:84, color:[106, 255, 249, 1]},
                    {value:1, left:128, color:[255, 255, 255, 1]},
                    {value:2, left:192, color:[108, 241, 255, 1]},
                    {value:3, left:256, color:[72, 226, 255, 1]},
                    {value:4, left:320, color:[72, 212, 255, 1]},
                    {value:5, left:380, color:[8, 182, 218, 1]},
                ]
                break;
            case 4:
                this.headsetFunctionService.ColorSectionArray = [
                    {value:0, left:40, color:[31, 191, 1, 1]},
                    {value:1, left:80, color:[94, 233, 44, 1]},
                    {value:2, left:120, color:[138, 250, 118, 1]},
                    {value:3, left:160, color:[176, 250, 118, 1]},
                    {value:4, left:200, color:[138, 243, 53, 1]},
                    {value:5, left:240, color:[108, 211, 27, 1]},
                    {value:6, left:280, color:[255, 255, 255, 1]},
                    {value:7, left:320, color:[27, 211, 0, 1]},
                    {value:8, left:360, color:[22, 177, 0, 1]},
                ]
                break;
            case 5:
                this.headsetFunctionService.ColorSectionArray = [
                    {value:0, left:0, color:[255, 0, 255, 1]},
                    {value:1, left:100, color:[255, 0, 255, 1]},
                    {value:2, left:250, color:[255, 0, 255, 1]},
                    {value:3, left:380, color:[255, 0, 255, 1]},
                ]
                break;
        }
        this.headsetFunctionService.dotindex = -1;
        this.headsetFunctionService.updateColorSection.emit(this.headsetFunctionService.ColorSectionArray)
    }

    ColorShiftStartClick() {}
    ColorShiftStopClick() {}
}