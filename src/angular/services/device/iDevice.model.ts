import { Injectable } from '@angular/core';
import {DeviceOBj} from './device.model';
import {protocolService} from '../service/protocol.service';

@Injectable()
export class iDeviceService implements DeviceOBj{
    VID: string;
    PID: string;
    FwVersion: string;
    DeviceName: string;
    Profile: any;
    _id:string;

    constructor(data:any,protocol:protocolService){
        this.VID = data.VID;
        this.PID = data.PID;
        this.DeviceName = data.DeviceName;
        this.Profile = data.Profile;
        this.FwVersion = data.FwVersion;
        this._id = data._id;
    }

    private abc(){
        console.log(this.VID);
        console.log(this.PID);
        console.log(this.DeviceName);
    }
}