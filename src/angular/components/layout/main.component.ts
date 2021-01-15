declare var System;
import { Component, OnInit, Output, Input, EventEmitter, SimpleChange, OnChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ElectronEventService } from '../../services/libs/electron/index';
import { protocolService } from '../../services/service/protocol.service';
import { TranslateService, LangChangeEvent } from 'ng2-translate';
let evtVar = System._nodeRequire('./backend/others/EventVariable');
let funcVar = System._nodeRequire('./backend/others/FunctionVariable');
let env = System._nodeRequire('./backend/others/env');
import { DeviceService, GetAppService, CommonService, FunctionService} from '../../services/device/index';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { Router } from '@angular/router';
let remote = System._nodeRequire('electron').remote;
let win = remote.getGlobal('MainWindow').win;
let SupportLanguage = System._nodeRequire('./backend/others/SupportData').SupportLanguage;
// import { NavComponent } from './nav/nav.component';
// import { ContentComponent } from './content/content.component';
let electron_Instance = window['System']._nodeRequire('electron').remote; 

@Component({
    selector: 'app-main',
    templateUrl: './components/layout/main.component.html',
    styleUrls: ['./components/layout/main.component.css'],
    providers: [protocolService]
})

export class MainComponent implements OnInit {
    // @ViewChild(NavComponent) NavComponent: NavComponent
    // @ViewChild(ContentComponent) ContentComponent: ContentComponent

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
        private functionService: FunctionService
    ) {
        this.commonService.setCurrentPage(0);
        this.functionService.routerChange.subscribe((routername) => {
            this.router.navigateByUrl(routername);
        })
    }

    ngOnInit() {
        setTimeout(() => {
            this.router.navigateByUrl('/content');
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
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
}