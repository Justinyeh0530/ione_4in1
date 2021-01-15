declare var System;
import { Injectable, EventEmitter } from '@angular/core';
import { ElectronEventService, EmitService } from '../libs/electron/index';
import { GetAppService } from '../device/index'

let evtVar = System._nodeRequire('./backend/others/EventVariable');
let funcVar = System._nodeRequire('./backend/others/FunctionVariable');
let env = window['System']._nodeRequire('./backend/others/env');

@Injectable()
export class icpEventService {
    status: number;
    constructor(private GetAppService: GetAppService, private emitService: EmitService) {
        // ElectronEventService.on('icpEvent').subscribe((e: any) => {
        //     var obj = JSON.parse(e.detail);
        //     if (obj.Func === evtVar.EventTypes.RefreshDevice) {
        //         if(obj.Param == 1){
        //             this.insert();          
        //         }
        //         else if(obj.Param == 0){
        //             this.remove()
        //         }
        //     }
        // });
    }


    event() {
        ElectronEventService.on('icpEvent').subscribe((e: any) => {
            try{
                var obj = JSON.parse(e.detail);
                this.emitService.emitTitle(obj.Param);


                // if(obj.Func === evtVar.EventTypes.ExitApp){
                //     this.Exitready();
                // }
            }catch(e){
                env.log('Error','icpEventService',e);
            }
        });
    }

    getStatus() {
        return this.status;
    }


    // Exitready(){
    //     this.emitService.emitTitle('Exitapp');
    // }

}