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
        private actionSyncService: ActionSyncService
    ) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
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
}