declare var System;
import { Component ,OnInit ,Output ,EventEmitter, OnDestroy, ViewChild, ElementRef,Inject} from '@angular/core';
import { protocolService } from '../../../services/service/protocol.service';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef ,MD_DIALOG_DATA} from '@angular/material';
import { DeviceService,GetAppService } from '../../../services/device/index';

@Component({
    selector: 'sm-checkDialog',
    templateUrl : './components/dialog/checkDialog/checkDialog.component.html',
    styleUrls: ['./components/dialog/checkDialog/checkDialog.component.css'],
    providers: [protocolService]
})

export class CheckDialogComponent implements OnInit, OnDestroy{

    accountname:any;
    accountemail:any;
    accountpicture:any;
    title:any;

    constructor(@Inject(MD_DIALOG_DATA) private dialogData: any, private getAppService: GetAppService,private mdDialogRef : MdDialogRef<CheckDialogComponent>, private translate: TranslateService){
        console.log('CheckDialogComponent loading complete');
    }

    ngOnInit(){
        this.title = this.dialogData.title;
        console.log(JSON.stringify(this.title));
    }

    ngAfterViewInit(){
    }


    ngOnDestroy(){
    }    

    ngOnChanges(){
    }

    OK(){
        this.mdDialogRef.close(true); 
    }

    close(){
        this.mdDialogRef.close();
    }
}