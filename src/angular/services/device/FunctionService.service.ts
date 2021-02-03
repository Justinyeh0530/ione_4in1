declare var System;
import { Injectable, EventEmitter } from '@angular/core';
let electron_Instance = window['System']._nodeRequire('electron').remote; 
import { Router } from '@angular/router';
import { HeadsetFunctionService } from './HeadsetFunctionService.service';

@Injectable()
export class FunctionService{
    updateFuncStatus: EventEmitter<object> = new EventEmitter();
    routerChange:EventEmitter<string> = new EventEmitter();
    changeTopbarEvent:EventEmitter<string> = new EventEmitter();
    topbarfunc:number = 1;
    headsetleftfunc:number = 0;

    constructor(private router: Router,
                private headsetFunctionService: HeadsetFunctionService
                )
    {
    }

    TopbarFunc(flag) {
        this.changeTopbarEvent.emit();
        this.topbarfunc = flag
        this.headsetleftfunc = 0;
        if(flag == 5) {
            this.routerChange.emit('/actionsync');
        } else if(flag == 1 || flag == 2) {
            this.routerChange.emit('/content');
        }
        switch(flag) {
            case 2:
                setTimeout(() => {
                    this.headsetFunctionService.initSpectrum();
                },500);
                break;
        }
    }

    ResetFunc() {
        this.topbarfunc = 1;
        this.headsetleftfunc = 0;
    }

    HeadsetLeftFunc(flag) {
        this.headsetleftfunc = flag;
        let obj = {
            ModelType: 3,
            topbarfunc: this.topbarfunc,
            headsetleftfunc: this.headsetleftfunc
        }
        this.updateFuncStatus.emit(obj);
    }
}