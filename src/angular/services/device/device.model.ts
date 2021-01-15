import {Injectable,EventEmitter,OnInit} from '@angular/core';  

// export interface DeviceModelProduct {
//     device: KeyboardModel;
// }

// @Injectable()
// export class DeviceModelProduct{
//     status:number;
//     // constructor(
//     //     public status:number
//     // ){}
// }

export interface DeviceOBj{
    VID:string;
    PID:string;
    FwVersion:string;
    DeviceName:string;
    Profile:any;
    _id:string;
}