declare var System;
import { Component ,OnInit ,Output ,EventEmitter, OnDestroy, ViewChild, ElementRef,Inject} from '@angular/core';
import { protocolService } from '../../../services/service/protocol.service';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef ,MD_DIALOG_DATA} from '@angular/material';
import { DeviceService,GetAppService } from '../../../services/device/index';
let SupportLanguage = System._nodeRequire('./backend/others/SupportData').SupportLanguage;

@Component({
    selector: 'sm-settingDialog',
    templateUrl : './components/dialog/settingDialog/settingDialog.component.html',
    styleUrls: ['./components/dialog/settingDialog/settingDialog.component.css'],
    providers: [protocolService]
})

export class SettingDialogComponent implements OnInit, OnDestroy{

    languageselect:any;
    LanguageData:any = []
    settingFunction:number = 1;
    version:any = '1.00.00.00'
    

    constructor(private getAppService: GetAppService, private deviceService:DeviceService, private mdDialogRef : MdDialogRef<SettingDialogComponent>, private translate: TranslateService){
        console.log('SettingDialogComponent loading complete');
    }

    ngOnInit() {
        for(let j = 0; j<SupportLanguage.length; j++) {
            let obj = {
                name: SupportLanguage[j].name,
                value: SupportLanguage[j].value,
                translate: SupportLanguage[j].name
            }
            this.LanguageData.push(obj);
        }
        this.version = this.getAppService.AppSetingObj.version
        console.log(22222,this.deviceService.pluginDeviceData)
    }

    ngAfterViewInit() {
    }


    ngOnDestroy() {
    }    

    ngOnChanges() {
    }

    setFunc(flag) {
        this.settingFunction = flag
    }

    languageSelect() {

    }

    OK() {
        this.mdDialogRef.close(true); 
    }

    close() {
        this.mdDialogRef.close();
    }
}