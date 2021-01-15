declare var System;
import { Component ,OnInit ,Output ,EventEmitter, OnDestroy, ViewChild, ElementRef,Inject} from '@angular/core';
import { protocolService } from '../../../services/service/protocol.service';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef ,MD_DIALOG_DATA} from '@angular/material';
import { DeviceService,GetAppService } from '../../../services/device/index';

@Component({
    selector: 'sm-checkDialog',
    templateUrl : './components/dialog/delayDialog/delayDialog.component.html',
    styleUrls: ['./components/dialog/delayDialog/delayDialog.component.css'],
    providers: [protocolService]
})

export class DelayDialogComponent implements OnInit, OnDestroy{

    accountname:any;
    accountemail:any;
    accountpicture:any;
    title:any;
    second:number;

    constructor(@Inject(MD_DIALOG_DATA) private dialogData: any, private getAppService: GetAppService,private mdDialogRef : MdDialogRef<DelayDialogComponent>, private translate: TranslateService){
        console.log('CheckDialogComponent loading complete');
    }

    ngOnInit(){
        // this.title = this.dialogData.title;
        // console.log(JSON.stringify(this.title));
        this.translate.get("Pleasewait").subscribe((res: string) => {
			this.title = res;
        });
        
        this.second = this.dialogData.second;
        if(this.second == undefined)
            this.second = 500;            

        setTimeout(() => {
            this.close();
        },this.second);
    }

    ngAfterViewInit(){
    }


    ngOnDestroy(){
    }    

    ngOnChanges(){
    }

    // OK(){
    //     this.mdDialogRef.close(true); 
    // }

    close(){
        this.mdDialogRef.close();
    }
}