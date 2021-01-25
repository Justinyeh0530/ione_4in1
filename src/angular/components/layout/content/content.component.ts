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
    }

    initData() {
        if(this.deviceService.currentDevice != undefined && this.deviceService.currentDevice.SN == "0x195D0xA005" && this.functionService.topbarfunc == 1 && this.functionService.headsetleftfunc == 1) {
            this.initEQ();
        }
    }

    ngOnInit() {
        this.initData();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    initEQ() {
        setTimeout(() => {
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
            case 'MicSideTone':
                range = 422;
                break;
        }
        if(document.getElementById(id)) {
            document.getElementById(id).style.backgroundImage = '-webkit-linear-gradient(left ,#FDBA3B 0%,#FDBA3B ' + (100 / range * this.headsetFunctionService[id+'ValueTemp']) + '%,#313131 ' + (100 / range * this.headsetFunctionService[id+'ValueTemp']) + '%, #313131 100%)'
        }
    }

    MicVolumeChange() {}

    MicVolumeBoundsChange() {}

    MicSideToneChange() {}

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
        // document.getElementById(`color-bar`).style.background = document.getElementById(`lighting-pattern${id}`).style.background;
        // console.log(3333, document.getElementById(`lighting-pattern${id}`).style.background)
        // console.log(444444,document.getElementById(`color-bar`).style.background)
        this.headsetFunctionService.ColorSectionArray = undefined;
        switch(id) {
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
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
}