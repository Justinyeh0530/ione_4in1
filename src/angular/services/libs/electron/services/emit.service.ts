
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class EmitService {
  private EmitSource = new Subject();
  EmitObservable =this.EmitSource.asObservable();
    constructor() { }
    //发射数据，当调用这个方法的时候，Subject就会发射这个数据，所有订阅了这个Subject的Subscription都会接受到结果
    emitTitle(title: string) {
        this.EmitSource.next(title);
    }
  
}
