import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class LanguageService {
    private LanguSource = new Subject();
    //获得一个Observable
    langObservable =this.LanguSource.asObservable();
    constructor() { }
    //发射数据，当调用这个方法的时候，Subject就会发射这个数据，所有订阅了这个Subject的Subscription都会接受到结果
    emitLang(title: string) {
        console.log('23456:'+title);
        this.LanguSource.next(title);
    }
}