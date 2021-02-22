declare var System;
import { Component, OnInit, Output, Input, EventEmitter, SimpleChange, OnChanges, ViewChild, ElementRef, ChangeDetectorRef, ApplicationRef} from '@angular/core';
import { ElectronEventService } from '../../../services/libs/electron/index';
import { protocolService } from '../../../services/service/protocol.service';
import { TranslateService, LangChangeEvent } from 'ng2-translate';
let evtVar = System._nodeRequire('./backend/others/EventVariable');
let funcVar = System._nodeRequire('./backend/others/FunctionVariable');
let env = System._nodeRequire('./backend/others/env');
import { DeviceService, GetAppService, CommonService, HeadsetFunctionService, FunctionService, ActionSyncService} from '../../../services/device/index';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { Router } from '@angular/router';
let remote = System._nodeRequire('electron').remote;
let win = remote.getGlobal('MainWindow').win;
// import { NavComponent } from './nav/nav.component';
// import { ContentComponent } from './content/content.component';
let electron_Instance = window['System']._nodeRequire('electron').remote; 

@Component({
    selector: 'app-nav',
    templateUrl: './components/layout/nav/nav.component.html',
    styleUrls: ['./components/layout/nav/nav.component.css'],
    providers: [protocolService]
})

export class NavComponent implements OnInit {
    // @ViewChild(NavComponent) NavComponent: NavComponent
    // @ViewChild(ContentComponent) ContentComponent: ContentComponent
    currentDevice:any;
    subscription:any;
    ButtonSelectImage:string = "url('./image/ButtonList_Select.png')"
    ButtonUnSelectImage:string = "url('./image/ButtonList_Normal.png')"
    checkActionSyncDeviceFlagEvent:any;

    constructor(
        private protocol: protocolService,
        private translate: TranslateService,
        private dialog: MdDialog,
        private deviceService: DeviceService,
        private getAppService: GetAppService,
        private router: Router,
        private commonService: CommonService,
        private cdr: ChangeDetectorRef, 
        private headsetFunctionService: HeadsetFunctionService,
        private functionService: FunctionService,
        private actionSyncService: ActionSyncService,
        private adr: ApplicationRef,
    ) {
    }

    ngOnInit() {
        this.actionSyncService.InitData();
        this.checkActionSyncDeviceFlagEvent = this.checkActionSyncDeviceFlag.bind(this)
        document.getElementById("nav").addEventListener('click', this.checkActionSyncDeviceFlagEvent)
    }

    /**
     * ngif變化時會觸發
     */
    ngDoCheck() {
        // if(this.functionService.topbarfunc == 5)
        //     this.actionSyncService.InitData();
    }

    ngOnDestroy() {
        document.getElementById("nav").removeEventListener('click', this.checkActionSyncDeviceFlagEvent)
    }

    LeftArrowClick() {
        let index = this.deviceService.supportDevice.findIndex(x => x.SN == this.deviceService.currentSupportDevice.SN)
        if(index != -1 && this.deviceService.supportDevice.length > 1) {
            this.functionService.ResetFunc();
            index = index - 1;
            if(index < 0)
                index = this.deviceService.supportDevice.length - 1;
            this.deviceService.currentSupportDevice = this.deviceService.supportDevice[index];
            this.deviceService.setCurrentDevice(this.deviceService.currentSupportDevice)
        }
    }

    RightArrowClick() {
        let index = this.deviceService.supportDevice.findIndex(x => x.SN == this.deviceService.currentSupportDevice.SN)
        if(index != -1 && this.deviceService.supportDevice.length > 1) {
            this.functionService.ResetFunc();
            index = index + 1;
            if(index >= this.deviceService.supportDevice.length)
                index = 0;
            this.deviceService.currentSupportDevice = this.deviceService.supportDevice[index];
            this.deviceService.setCurrentDevice(this.deviceService.currentSupportDevice)
        }
    }

    clickshow(event) {
        console.log('clickshow',event)
    }

    checkActionSyncDeviceFlag(event) {
        if(this.actionSyncService.actionSyncDevicFlag) {
            this.actionSyncService.actionSyncDevicFlag = 0;
            this.actionSyncService.actionSyncDeviceFunc(0);
            for(let i = 1; i <= 3; i++) {
                if(document.getElementById('actionSyncDevice' + i))
                    document.getElementById('actionSyncDevice' + i).style.backgroundColor = "black";
            }
        }
    }
}