declare var System;
import { Component ,OnInit, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {protocolService} from '../services/service/protocol.service';
import {LanguageService} from '../services/service/languageService.service';
import {TranslateService} from 'ng2-translate';
import {EmitService,ElectronEventService } from '../services/libs/electron/index';
import { icpEventService } from '../services/service/icpEventService.service';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { DeviceService, GetAppService, CommonService} from '../services/device/index';
import { Router } from '@angular/router';

const {ipcRenderer} = System._nodeRequire('electron');
let evtVar = System._nodeRequire('./backend/others/EventVariable');
let funcVar = System._nodeRequire('./backend/others/FunctionVariable');
let env = System._nodeRequire('./backend/others/env');
let CountryCode = System._nodeRequire('./backend/others/SupportData').CountryCode;
let electron_Instance = window['System']._nodeRequire('electron').remote; 
let Project = System._nodeRequire('./package');

@Component({
    selector: 'sm-app',
    templateUrl : './components/app.component.html',
    // template: '<h1>我的第一个 Angular 应用</h1>',
    styleUrls: ['./components/app.component.css'],
    providers: [protocolService, icpEventService, LanguageService]
})

export class AppComponent implements OnInit{

    constructor(
        private icpEventService: icpEventService,
        private deviceService:DeviceService,
        private router:Router,
        private cdr: ChangeDetectorRef,
        private getAppService: GetAppService,
        private protocol: protocolService,
        private translate: TranslateService
    ){
        let langObj = [];
        langObj.push(`Open ${Project.project.projectname}`);langObj.push(`Quit ${Project.project.projectname}`); 
        ipcRenderer.send("Open", langObj);
        icpEventService.event();
        this.getAppService.getAppsettingFormDB();
    }

    ngOnInit() {
        this.deviceService.getDevice();
        ElectronEventService.on('icpEvent').subscribe((e: any) => {
            var obj = JSON.parse(e.detail);
            if(obj.Func == 'RefreshDevice') {
                console.log('RefreshDevice')
                setTimeout(() => {
                    this.deviceService.getDevice();
                },500);
            }
        });

        
        $("#loading").fadeOut(100);
        //添加语言
        this.translate.addLangs(['tw', 'en']);
        this.translate.use('en');

        let obj = {
            Type: funcVar.FuncType.System,
            SN: "",
            Func: funcVar.FuncName.InitDevice,
            Param: ""
        }
        //呼叫後端函數
        this.protocol.RunSetFunction(obj).then((data) => { });
    }

    ngAfterViewInit(){

    }
}