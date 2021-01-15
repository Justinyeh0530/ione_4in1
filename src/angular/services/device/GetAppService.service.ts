import { Injectable, EventEmitter } from '@angular/core';
let electron_Instance = window['System']._nodeRequire('electron').remote; 

@Injectable()
export class GetAppService{
    dbService = electron_Instance.getGlobal('AppProtocol').deviceService.nedbObj
    constructor(){
    }
    hasUpdateTip=false;
    AppSetingObj:any
    updateAppSettingData: EventEmitter<string> = new EventEmitter();

    /**
     * get Appsetting Data from DB
     */
    getAppsettingFormDB() {
        this.dbService.getAppSetting().then((data) => {
            this.AppSetingObj = data[0];
            this.updateAppSettingData.emit('updateAppSettingData')
        })
    }

    /**
     * get AppSetting
     */
    getAppSetting() {
        //console.log('getAppSetting',this.AppSetingObj);
        return this.AppSetingObj;
    }

    /**
     * Update Appsetting Data to DB
     */
    updateAppsetting() {
        if(this.AppSetingObj != undefined)
            this.dbService.saveAppSetting(this.AppSetingObj).then(()=>{});
    }
}