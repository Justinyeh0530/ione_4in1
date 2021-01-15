declare var System;
import { Injectable, EventEmitter } from '@angular/core';
import { iDeviceService } from './iDevice.model';
import { ElectronEventService } from '../../services/libs/electron/index'
let logger = System._nodeRequire('./backend/others/logger');
const loggertitle = "deviceService";
let electron_Instance = window['System']._nodeRequire('electron').remote; 
var dbObj = window['System']._nodeRequire('./backend/dbapi/AppDB');
import * as _ from 'lodash'

@Injectable()
export class DeviceService{
    dbService = electron_Instance.getGlobal('AppProtocol').deviceService.nedbObj
    //dbService = dbObj.getInstance();
    updatCurrentDeviceData: EventEmitter<object> = new EventEmitter();
    content_Refresh: EventEmitter<object> = new EventEmitter();
    updateSupportDevice: EventEmitter<object> = new EventEmitter();
    pluginDeviceData = [];
    AllDeviceData = [];
    deviceDataForUI = [];
    supportDevice = [];

  
    currentDevice:any = undefined;
    currentSupportDevice:any = undefined;


    constructor(
    ) {
        console.log('DeviceService_constructor', this.dbService);
        ElectronEventService.on('icpEvent').subscribe((e: any) => {
            var obj = JSON.parse(e.detail)
            if(obj.Func == "SwitchUIProfile") {
                let index = this.pluginDeviceData.findIndex(x => x.SN == obj.Param.SN)
                if(index != -1) {
                    this.pluginDeviceData[index].deviceData.profileindex == obj.Param.Profile;
                    if(obj.Param.LayerIndex != undefined)
                        this.pluginDeviceData[index].deviceData.profileLayerIndex[obj.Param.Profile] = obj.Param.LayerIndex
                }
                let obj2 = this.findNestedIndices(this.deviceDataForUI,'SN',obj.Param.SN)
                if(obj2 != undefined) {
                    this.deviceDataForUI[obj2.i][obj2.j].deviceData.profileindex = obj.Param.Profile;
                    if(obj.Param.LayerIndex != undefined)
                        this.deviceDataForUI[obj2.i][obj2.j].deviceData.profileLayerIndex[obj.Param.Profile] = obj.Param.LayerIndex
                }
            }
        });
    }

    getAllSupportDevice() {
        return new Promise((resolve,reject) => {
            this.dbService.getSupportDevice().then((data) => {
                this.supportDevice = _.cloneDeep(data);
                this.supportDevice = this.ArraySort(this.supportDevice,'ModelType')
                resolve();
            })
        });
    }

    checkAllSupportDevice(SN) {
        if(this.currentDevice != undefined && this.currentDevice.SN == SN)
            return true;
        else
            return false;
    }
    
    /**
     * get all pluging device
     */
    getDevice() {
        return new Promise((resolve,reject) => {
            this.getAllSupportDevice().then(() => {
                let TempData = _.cloneDeep(this.pluginDeviceData)
                let AllDeviceData = [];
                this.dbService.getPluginDevice().then((data) => {
                    //var data=JSON.parse(JSON.stringify(temp_data));
                    console.log('dbservice_getPluginDevice()',data);
                    for(let i of data[0].Mouse){
                        AllDeviceData.push(i);
                    }
                    for(let i of data[0].Keyboard){
                        AllDeviceData.push(i);
                    }
                    for(let i of data[0].Headset){
                        AllDeviceData.push(i);
                    }
                    this.dbService.getAllDevice().then((data) => {
                        this.pluginDeviceData = JSON.parse(JSON.stringify(AllDeviceData));
                        var data=JSON.parse(JSON.stringify(data));
                        console.log(' this.dbservice.getAllDevice().then',data)
                        for(let i = 0; i < this.pluginDeviceData.length; i++) {
                            let index = data.findIndex(x => x.SN == this.pluginDeviceData[i].SN)
                            let TempDataIndex = TempData.findIndex(x => x.SN == this.pluginDeviceData[i].SN)
                            if(index != -1 && TempDataIndex == -1)
                                this.pluginDeviceData[i].deviceData = data[index];
                            else if(TempDataIndex != -1)
                                this.pluginDeviceData[i] = TempData[TempDataIndex]
                        }
                        for(let i = 0; i < this.supportDevice.length; i++) {
                            let index = this.pluginDeviceData.findIndex(x => x.SN == this.supportDevice[i].SN);
                            if(index != - 1) 
                                this.supportDevice[i].pluginDevice = this.pluginDeviceData[index];
                        }
                        
                        this.currentSupportDevice = this.supportDevice[0];
                        this.setCurrentDevice(this.currentSupportDevice)
                        this.updateSupportDevice.emit(this.currentSupportDevice)
                        resolve();
                    })
                })
            });
        });
    }

    checkHasDeviceExist(){
        return this.pluginDeviceData.length > 0 ? true : false;
    }


    setAssignTargetValue(index,parameter,value){
        this.pluginDeviceData[index][parameter] = value;
    }

    getAssignTarget(index){
        return this.pluginDeviceData[index];
    }

    /**
     * 取得
     * @param ModelType 1:Mouse 2:Keyboard 3:Headset
     */
    getDeviceFormModel(ModelType) {
        let result = [];
        for(let i of this.pluginDeviceData) {
            if(i.ModelType == ModelType)
                result.push(i)
        }
        console.log('getDeviceFormModel',result);
        return result;
    }

    getCurrentDeviceProfileIndex(){
        let index = this.currentDevice.deviceData.profile.findIndex((x) => x.profileid == this.currentDevice.deviceData.profileindex)
        if(index==-1){
            console.log('getCurrentDeviceProfileIndex取得失敗',this.currentDevice.deviceData.profileindex);
        }

        return index;
    }

    /**
     * 判斷當前裝置存不存在
     */
    checkDeviceExist() {
        let result = false;
        if(this.currentDevice != undefined) {
            let index = this.pluginDeviceData.findIndex(x => x.SN == this.currentDevice.SN );
            if(index != -1)
                result = true;
            else
                result = false;
        } else {
            result = undefined;
        }     
        console.log('checkDeviceExist',result);
        return result;
    }

    /**
     * 設定當前裝置
     * @param obj 
     */
    setCurrentPageDevice(SN) {
        let result = false;
        let index = this.pluginDeviceData.findIndex(x => x.SN == SN );
        if(index != -1) {
            this.currentDevice = this.pluginDeviceData[index];
            result = true;
        }
        else {
            this.currentDevice = undefined;
            result = false
        }
        console.log('setCurrentPageDevice',this.currentDevice)
        return result;
    }

    /**
     * 取得當前裝置
     */
    getCurrentDevice() {
        return this.currentDevice;
    }

    /**
     * set Current Device
     * @param data
     */
    setCurrentDevice(data) {
        this.currentDevice = data;
        this.updatCurrentDeviceData.emit(this.currentDevice)
    }

    findNestedIndices(array,key, value) {
        let i;
        let j;
        for (i = 0; i < array.length; ++i) {
            const nestedArray = array[i];
            for (j = 0; j < nestedArray.length; ++j) {
                const object = nestedArray[j];
                if (object[key] === value) {
                    return { i, j };
                }
            }
        }
        return undefined;
    }

    /**
	 * 排列Array順序
	 * @param array 
	 * @param key 
	 */
    ArraySort(array, key) {
        return array.sort(function(a, b) {
            var x = a[key];
            var y = b[key];
            return x - y;
        });
	}
}