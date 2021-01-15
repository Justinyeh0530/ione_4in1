const EventEmitter = require('events');
const env = require('../../others/env');
var openurl = require('electron').shell;
var evtType = require('../../others/EventVariable').EventTypes;
var funcVar = require('../../others/FunctionVariable');
var nedbObj = require('../../dbapi/AppDB');

'use strict'
var _this;
class FWUpdateSilent extends EventEmitter {
    constructor() {
        env.log('FWUpdateSilent','FWUpdateSilent class','begin');
        super();
        _this = this;
        _this.LaunchWinSocket = require(`../nodeDriver/x64/LaunchWinSocket.node`);
        _this.nedbObj = nedbObj.getInstance();
        
        _this.TimerWaitForLaunch = null;//Timer For Function
        _this.WaitForLaunchCount = 0;
        _this.TimerGetProcess = null;//Timer For Function
        _this.LaunchStep = 0;
        _this.LaunchStepCount = 2;
        _this.LaunchPath = [];
        
        _this.TimerFakerProcess = null;//Timer For Function

        _this.CurrentProcess = 0;
        _this.ProcessFailCount = 0;
        _this.SuccessCount = 0;
    }

    static getInstance() {
        if (this.instance) {
            env.log('FWUpdateSilent', 'getInstance', `Get exist Device() INSTANCE`);
            return this.instance;
        }
        else {
            env.log('FWUpdateSilent', 'getInstance', `New Device() INSTANCE`);
            this.instance = new FWUpdateSilent();
            
            _this.GetSupportDevice().then(()=>{  
            });

            return this.instance;
        }
    }
    GetSupportDevice() {
        return new Promise((resolve,reject) => {
            _this.nedbObj.getSupportDevice().then((data)=>{ 
                _this.SupportDevice = data;
                resolve();
            });
        });
    }
    LaunchFWUpdate(Obj){
        _this.LaunchPath = [];

        var DeviceInfo;
        for(var i = 0; i < _this.SupportDevice.length; i++) {
            var sn = _this.SupportDevice[i].vid[0]+_this.SupportDevice[i].pid[0];
            if (Obj.SN == sn) {
                DeviceInfo = _this.SupportDevice[i];
            }
        }
        for(var i = 0; i < DeviceInfo.FWUpdateExtension.length; i++) {
            _this.LaunchPath.push(Obj.execPath.replace('.zip', DeviceInfo.FWUpdateExtension[i]));
        }
        _this.LaunchStepCount = _this.LaunchPath.length;

        _this.SuccessCount = 0;
        _this.LaunchStep = 0;
        var ObjFWUpdate ={execPath:_this.LaunchPath[_this.LaunchStep],Step:_this.LaunchStep};
        _this.ExecuteFWUpdate(ObjFWUpdate);
    }
    ExecuteFWUpdate(Obj){
        // if(){
        //     _this.LaunchWinSocket.Executefile(Obj.execPath);
        // }else{
        //     _this.LaunchWinSocket.Executefile(Obj.execPath+"Wireless");
        // }
        _this.LaunchWinSocket.Executefile(Obj.execPath);

        _this.ProcessFailCount = 0;
        _this.WaitForLaunchCount = 0;
        clearInterval(_this.TimerWaitForLaunch);
        _this.TimerWaitForLaunch = null;
        _this.TimerWaitForLaunch = setInterval(_this.OnTimerWaitForLaunch, 1000);
    }
    OnTimerWaitForLaunch() {

        var csRtn1 = _this.LaunchWinSocket.SendMessageToSetver("FirmwareUpdater","GETPROGRESS");
        if (_this.WaitForLaunchCount >= 15) {
            _this.WaitForLaunchCount = 0;
            clearInterval(_this.TimerWaitForLaunch);
            _this.TimerWaitForLaunch = null;
            console.log("LaunchFWUpdate-Failed:")
            env.log('FWUpdateSilent','OnTimerWaitForLaunch','LaunchFWUpdate-Failed');
            
            var Obj2 = {
                Func: evtType.SendFWUPDATE,
                SN: null,
                Param: {Data:"FAIL"}
            };
            _this.emit(evtType.ProtocolMessage, Obj2);
        }
        else if (csRtn1.indexOf("GETPROGRESSOK:") != -1) {
            var Obj2 = {
                Func: evtType.SendFWUPDATE,
                SN: null,
                Param: {Data:"START"}
            };
            _this.emit(evtType.ProtocolMessage, Obj2);
            
            
            var ProcessSum = 100/_this.LaunchStepCount*_this.LaunchStep;
            var Process2 = ProcessSum.toString();
            Obj2.Param.Data =Process2;
            _this.emit(evtType.ProtocolMessage, Obj2);

            _this.WaitForLaunchCount = 0;
            clearInterval(_this.TimerWaitForLaunch);
            _this.TimerWaitForLaunch = null;
            console.log("LaunchFWUpdate-Start To Update:")
            
            _this.StartFWUpdate();
            //------------------------            
            
        }
        _this.WaitForLaunchCount ++;
    }
    SwitchDeviceHotPlug(bFlag){
        var Obj2 = {
            Func: "SwitchHotPlug",
            SN: null,
            Param: bFlag
        };
        _this.emit(evtType.ProtocolMessage, Obj2);
    }
    StartFWUpdate(){
        //"START" "GETPROGRESS"
        //_this.SwitchDeviceHotPlug(0);
        var csRtn1 = _this.LaunchWinSocket.SendMessageToSetver("FirmwareUpdater","START");//"START"
        console.log("LaunchWinSocket-Message:",csRtn1)
        
        if (csRtn1.indexOf("Device Not Found") != -1) {
            
            _this.TerminateFWUpdate(0,function(csRtn){
                env.log('FWUpdateSilent','StartFWUpdate','Device Not Found');
                _this.CurrentProcess = 0;
                clearInterval(_this.TimerFakeProcess);
                _this.TimerFakeProcess = null;
                _this.TimerFakeProcess = setInterval(_this.OnTimerFakeProcess, 20);
            });
        } else {
            clearInterval(_this.TimerGetProcess);
            _this.TimerGetProcess = null;
            _this.TimerGetProcess = setInterval(_this.OnTimerGetProcess, 100);
        }
        
    }
    OnTimerFakeProcess() {
        _this.CurrentProcess ++;
        var ProcessSum = 100/_this.LaunchStepCount*_this.LaunchStep + _this.CurrentProcess;

        if (ProcessSum >= 100/_this.LaunchStepCount * (_this.LaunchStep+1)){
            clearInterval(_this.TimerFakeProcess);
            _this.TimerFakeProcess = null;
            _this.FinishedFWUpdate();
        }else{
            var Process2 = ProcessSum.toString();    
            var Obj2 = {
                Func: evtType.SendFWUPDATE,
                SN: null,
                Param: {Data:Process2}
            };
            _this.emit(evtType.ProtocolMessage, Obj2);
        }
        
    }
    OnTimerGetProcess() {
        var csRtn1 = _this.LaunchWinSocket.SendMessageToSetver("FirmwareUpdater","GETPROGRESS");
        
        if (csRtn1.indexOf("PASS") != -1) {
            
            _this.SuccessCount++;
            clearInterval(_this.TimerGetProcess);
            _this.TimerGetProcess = null;
            
            _this.TerminateFWUpdate(0,function(csRtn){
                console.log("LaunchWinSocket TerminatePrecess:",csRtn)
                _this.FinishedFWUpdate();
            });
        }
        else if (csRtn1.indexOf("Not Found ProcessName App") != -1) {
            clearInterval(_this.TimerGetProcess);
            _this.TimerGetProcess = null;
            _this.TerminateFWUpdate(0,function(csRtn){
                console.log("LaunchWinSocket TerminatePrecess:",csRtn)
                env.log('FWUpdateSilent','TerminatePrecess:',csRtn);
                env.log('FWUpdateSilent','FAIL-CurProcess:',CurProcess);
                _this.ProcessFailCount = 0;
                var Obj2 = {
                    Func: evtType.SendFWUPDATE,
                    SN: null,
                    Param: {Data:"FAIL"}
                };
                _this.emit(evtType.ProtocolMessage, Obj2);
            });
        }
        else
        {
            var Processlength = csRtn1.split("GETPROGRESSOK:").length;
            var Process = parseInt(csRtn1.split("GETPROGRESSOK:")[Processlength-1]/_this.LaunchStepCount);
            var CurProcess = parseInt(csRtn1.split("GETPROGRESSOK:")[Processlength-1]);

            if(_this.CurrentProcess == CurProcess && _this.ProcessFailCount >=80 && CurProcess <100) {//FAIL
                clearInterval(_this.TimerGetProcess);
                _this.TimerGetProcess = null;
                _this.TerminateFWUpdate(0,function(csRtn){
                    console.log("LaunchWinSocket TerminatePrecess:",csRtn)
                    env.log('FWUpdateSilent','TerminatePrecess:',csRtn);
                    env.log('FWUpdateSilent','FAIL-CurProcess:',CurProcess);
                    _this.ProcessFailCount = 0;
                    var Obj2 = {
                        Func: evtType.SendFWUPDATE,
                        SN: null,
                        Param: {Data:"FAIL"}
                    };
                    _this.emit(evtType.ProtocolMessage, Obj2);
                });
            } 
            else if(_this.CurrentProcess == CurProcess) {
                _this.ProcessFailCount ++;
            }else{
                _this.ProcessFailCount = 0;
                _this.CurrentProcess = CurProcess;
                //ProcessSum
                var ProcessSum = 100/_this.LaunchStepCount*_this.LaunchStep + Process;
    
                var Process2 = ProcessSum.toString();
                console.log("LaunchWinSocket-Message:GETPROGRESSOK:",Process2)
                env.log('FWUpdateSilent','GETPROGRESSOK:',Process2);
    
                var Obj2 = {
                    Func: evtType.SendFWUPDATE,
                    SN: null,
                    Param: {Data:Process2}
                };
                _this.emit(evtType.ProtocolMessage, Obj2);
            }
        }
    }
    TerminateFWUpdate(Obj,callback){

        var csRtn = _this.LaunchWinSocket.TerminatePrecess("FirmwareUpdater");
        //console.log("LaunchWinSocket TerminatePrecess:",csRtn)
        //_this.SwitchDeviceHotPlug(1);
        callback(csRtn);
    }
    
    FinishedFWUpdate(){
        _this.LaunchStep++;
        if (_this.LaunchStep == _this.LaunchStepCount) {//Finished
            console.log("FinishedFWUpdate")
            var Obj2 = {
                Func: evtType.SendFWUPDATE,
                SN: null,
                Param: {Data:"PASS"}
            };
            if (_this.SuccessCount<=0) {
                Obj2.Param.Data = "FAIL";
                env.log('FWUpdateSilent','FAIL-FinishedFWUpdate-SuccessCount:',_this.SuccessCount);
            }
            _this.emit(evtType.ProtocolMessage, Obj2);
        }
        else
        {
            var ProcessSum = 100/_this.LaunchStepCount*_this.LaunchStep + 0;
            var Process2 = ProcessSum.toString();
            var Obj2 = {
                Func: evtType.SendFWUPDATE,
                SN: null,
                Param: {Data:Process2}
            };
            _this.emit(evtType.ProtocolMessage, Obj2);

            console.log("ExecuteFWUpdate LaunchStep:",_this.LaunchStep)
            var ObjFWUpdate ={execPath:_this.LaunchPath[_this.LaunchStep],Step:_this.LaunchStep};
            _this.ExecuteFWUpdate(ObjFWUpdate);
        }
        
    }
}

module.exports = FWUpdateSilent;