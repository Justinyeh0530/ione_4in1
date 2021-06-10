var events = require('events');
var env = require('../others/env');
var fs = require('fs');
var path = require('path');
var funcVar = require('../others/FunctionVariable');
var evtType = require('../others/EventVariable').EventTypes;
var AppObj = require("../dbapi/AppDB");
var JsonDBObj = require("../dbapi/JsonDB");
var updateObj = require('../others/update');
var ua = require('universal-analytics');
const osLocale = require('os-locale')
var UAflag = 0;
var deviceService = require('./service/DeviceService')
var FWUpdateService = require('./service/FWUpdateService');
var os = require('os');
var appFullPath = undefined;
var exec = require('child_process').exec;
'use strict';

var __extends = this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p)) d[p] = b[p];

    function __() {
        this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var ProtocolInterface = (function (_super) {
    __extends(ProtocolInterface, _super);
    var _this;

    function ProtocolInterface() {
        try {
            _this = this;
            _super.call(this);
            env.log( 'Interface', 'ProtocolInterface', " New ProtocolInterface INSTANCE. ");

            _this.AppDB = AppObj.getInstance();
            _this.deviceService = deviceService.getInstance();
            _this.deviceService.on(evtType.ProtocolMessage, _this.OnProtocolMessage)
            
            //------------------FWUpdateService------------------
            _this.FWUpdateService = FWUpdateService.getInstance();
            _this.FWUpdateService.on(evtType.ProtocolMessage, _this.OnFWUpdateMessage)
            _this.HotPlugFlag = true;       
            _this.WaitRefreshDevice = false;
            //------------------FWUpdateService------------------

            _this.JsonDB = new JsonDBObj.JsonDB();       

            //-- init GA ----//
            _this.UAinit();

            if (env.isWindows){
                if (env.arch == 'ia32'){
                    _this.hiddevice = require(`./nodeDriver/x32/hiddevice.node`);
                }else{
                    _this.hiddevice = require(`./nodeDriver/x64/hiddevice.node`);
                }
                
            } else if (env.isMac) {
                _this.hiddevice = require(`./nodeDriver/darwin/hiddevicemac.node`);
            }
            

            _this.update = new updateObj.UpdateClass();
            _this.update.on(evtType.ProtocolMessage, _this.OnProtocolMessage);
            _this.hiddevice.DebugMessageCallback(_this.DebugCallback);
            _this.hiddevice.StartHidPnpNotify();
            _this.hiddevice.HIDPnpCallBack(_this.HIDDevicePnp);

            if (_this.hiddevice === undefined)
                env.log( "Interface", "InterfaceClass", `hiddevice init error.`);
            var bActionSync = [];
            for (let i = 0; i < 2; i++) {
                bActionSync[i] = false;
            }

            var runPath = path.join(__dirname,'../../runDefaultAudio.cmd');
            console.log('runPath : '+runPath);
            if (fs.existsSync(runPath)) {
                console.log('runDefaultAudio exists')
                exec(runPath,function(err,data){
                    if(err)
                        console.log(err)
                    else {
                        //執行一次後把runDefaultAudio.cmd 刪除，指執行一次預設值設定
                        console.log('runDefaultAudio true...');
                        fs.unlinkSync(runPath);
                    }
                })

            } else {
                console.log('runDefaultAudio does not exists')
            }
        //-------------InitDevice---------------------
        } catch (ex) {
            env.log('Interface Error', 'ProtocolInterface', `ex:${ex.message}`);
        }
    }

    ProtocolInterface.prototype.InitDevice = function (callback) {
        _this.deviceService.initDevice().then(() => {
            console.log('initDevice finish')
        });
    }
    ProtocolInterface.prototype.DeleteMacroFunction = function (Obj,callback) {
        env.log('Interface','DeleteMacroFunction','begin');
        
        return new Promise(function (resolve) {
            try {
                _this.AppDB.getMacro().then(function (doc) {
                    var MacroData = doc;
                    for (var index = 0; index < MacroData.length; index++) {
                        if (MacroData[index].value == Obj) {//Obj is nowMacroSelect.value
                            _this.AppDB.DeleteMacro(Obj).then(function (doc) {
                                //callback("DeleteMacro finish");
                                resolve("DeleteMacro finish");
                            });
                        }
                    }
                });
                _this.AppDB.getAllDevice().then(function (doc) {
                });

            } catch (ex) {
                env.log('Interface Error', 'CloseAllDevice', `ex:${ex.message}`);
                resolve(0);
            }
        });
    //     _this.deviceService.DeleteMacroFunction(Obj).then(() => {
    //         console.log('DeleteMacro finish')
    //     });
    }

    //关闭所有设备
    ProtocolInterface.prototype.CloseAllDevice = function (callback) {

        return new Promise(function (resolve) {
            try {
                env.log('Interface', 'CloseAllDevice', ` Begin Close Device `);
                resolve(0);
            } catch (ex) {
                env.log('Interface Error', 'CloseAllDevice', `ex:${ex.message}`);
                resolve(0);
            }
        });

    };

    ProtocolInterface.prototype.HIDDevicePnp = function (Obj) {     
        //if (_this.HotPlugFlag == true) {
            _this.deviceService.HotPlug(Obj);
        //}  
    }

    ProtocolInterface.prototype.DebugCallback = function (Obj) {
        env.log('Interface', 'DebugCallback', JSON.stringify(Obj));
    }

    ProtocolInterface.prototype.KeyDataCallback = function (Obj) {
        var Obj2={
            Type : funcVar.FuncType.System,
            SN : null,
            Func : evtType.KeyDataCallback,
            Param : Obj
        };
        _this.emit(evtType.ProtocolMessage, Obj2);

    }

    //Application Event callback
    ProtocolInterface.prototype.AppEventCallback = function (Obj) {
        env.log('Interface','AppEventCallback',JSON.stringify(Obj));
        if(appFullPath == undefined)
            appFullPath = Obj;
        if(appFullPath != Obj){
            appFullPath = Obj;
            var Obj2={
                Type : funcVar.FuncType.System,
                SN : null,
                Func : evtType.AppChanged,
                Param : Obj
            };
            _this.emit(evtType.ProtocolMessage, Obj2);
        }
    }

    ProtocolInterface.prototype.OnProtocolMessage = function (Obj) {
        if (Obj.Func == evtType.RefreshDevice) {
            setTimeout(function(){
                if (_this.WaitRefreshDevice == true) {
                    _this.WaitRefreshDevice = false;
                    var Obj2 = {
                        Func: evtType.SendFWUPDATE,
                        SN: null,
                        Param: {Data:"PASS"}
                    };
                    _this.emit(evtType.ProtocolMessage, Obj2);
                }
            },1500);
        }
        _this.emit(evtType.ProtocolMessage, Obj);
        
    }
    ProtocolInterface.prototype.OnFWUpdateMessage = function (Obj) {
        if (Obj.Func == evtType.SendFWUPDATE && Obj.Param.Data == "PASS"){
            _this.WaitRefreshDevice = true;
        }else
        if (Obj.Func == "SwitchHotPlug"){
            _this.HotPlugFlag = Obj.Param;
            // if (_this.HotPlugFlag == true) {
            //     _this.InitDevice(function (){});
            // }
        }else{
            _this.emit(evtType.ProtocolMessage, Obj);
        }
    }

    //运行函数
    ProtocolInterface.prototype.RunFunction = function (Obj, callback) {
        try {
            if (!_this.CheckParam(Obj)) {
                callback('Error', 'ProtocolInterface.RunFunction');
                return;
            }
            if (Obj.Func == funcVar.FuncName.InitDevice) {
                _this.InitDevice(callback);
                return;
            }
            //-----------------------------------
            else if (Obj.Func == funcVar.FuncName.UpdateApp) {
                _this.update.UpdateApp();
                return;
            } else if(Obj.Func == funcVar.FuncName.GA){
                _this.GA(Obj.Param);
                return;
            } else if (Obj.Func == funcVar.FuncName.DownloadInstallPackage) {
                _this.update.DownloadInstallPackage().then(function (data) {});
                return;
            } else if (Obj.Func == funcVar.FuncName.UpdateFW) {
                _this.update.UpdateFW();
                return;
            } else if(Obj.Func == funcVar.FuncName.downloadFile) {
                _this.downloadFile(Obj.Param);
                return;
            } else if (Obj.Func == funcVar.FuncName.DownloadFWInstallPackage) {
                _this.update.DownloadFWInstallPackage().then(function (data) {});
                return;
            } else if (Obj.Func == funcVar.FuncName.ExecFile) {
                _this.ExecFile(Obj.Param);
                return;
            } else if (Obj.Func == funcVar.FuncName.LaunchFWUpdate) {
                _this.FWUpdateService.LaunchFWUpdate(Obj.Param);
                return;      
            } else if (Obj.Func == funcVar.FuncName.ChangeWindowSize) {
                var options = {
                    Type: funcVar.FuncType.System,
                    Func: evtType.ChangeWindowSize,
                    Param: Obj.Param
                }
                _this.emit(evtType.ProtocolMessage, options);
                return;
            }  
            else if (Obj.Func == funcVar.FuncName.ShowWindow) {
                var options = {
                    Type: funcVar.FuncType.System,
                    Func: evtType.ShowWindow,
                    Param: Obj.Param
                }
                _this.emit(evtType.ProtocolMessage, options);
                return;
            } else if (Obj.Func == funcVar.FuncName.QuitApp) {
                var options = {
                    Type: funcVar.FuncType.System,
                    Func: evtType.QuitApp,
                    Param: Obj.Param
                }
                _this.emit(evtType.ProtocolMessage, options);
                return;
            }else if (Obj.Func == funcVar.FuncName.Facebooklogin) {
                var options = {
                    Type: funcVar.FuncType.System,
                    Func: evtType.Facebooklogin,
                    Param: Obj.Param
                }
                _this.emit(evtType.ProtocolMessage, options);
                return;
            }else if (Obj.Func == funcVar.FuncName.Googlelogin) {
                var options = {
                    Type: funcVar.FuncType.System,
                    Func: evtType.Googlelogin,
                    Param: Obj.Param
                }
                _this.emit(evtType.ProtocolMessage, options);
                return;
            }else if (Obj.Func == funcVar.FuncName.Twitchlogin) {
                var options = {
                    Type: funcVar.FuncType.System,
                    Func: evtType.Twitchlogin,
                    Param: Obj.Param
                }
                _this.emit(evtType.ProtocolMessage, options);
                return;
            }else if (Obj.Func == funcVar.FuncName.HideApp) {
                var options = {
                    Type: funcVar.FuncType.System,
                    Func: evtType.HideApp,
                    Param: Obj.Param
                }
                _this.emit(evtType.ProtocolMessage, options);
                return;
            }
            else if (Obj.Type == funcVar.FuncType.System) 
            {
                var fn = _this[Obj.Func];
                fn(Obj.Param).then(function (data) {
                    callback(data);
                });
                return;
            }
            
            switch (Obj.Type) {
                case funcVar.FuncType.Apmode:
                case funcVar.FuncType.Device:
                case funcVar.FuncType.Mouse:
                case funcVar.FuncType.Keyboard:
                    _this.deviceService.RunFunction(Obj,callback);
                    break;

                default:
                    callback('InterFace RunFun Error', Obj.Type);
                    return;
            }
        } catch (ex) {
            env.log('Interface Error', 'RunFunction', ` ex:${ex.message}`);
        }
    };
    ProtocolInterface.prototype.ExecFile = function(obj) {
        env.log('interface','ExecFile',`${obj.path}`)
        if(obj.path.indexOf('UpdateApp.bat') != -1) {
            let batPath = path.resolve(path.join(env.appRoot,"/data/UpdateApp.bat"));
            if(fs.existsSync(batPath))
                fs.unlinkSync(batPath)
            let filename = (obj.filename.split('.zip')[0]);
            filename = path.resolve(path.join(env.appRoot,"/data/"+filename));
            let batData = "start \"\" \"" + filename + ".exe\""+" /SUPPRESSMSGBOXES /NORESTART";
            fs.writeFileSync(batPath,batData)
            var T_Path_Stringify=JSON.stringify(obj.path);
            exec(T_Path_Stringify,function(err,data){
                if(err)
                    console.log(err)
                else
                    console.log('true')
            })
        } else {
            exec(T_Path_Stringify,function(err,data){
                if(err)
                    console.log(err)
                else
                    console.log('true')
            })
        }
    }
    
    //检查参数正确性
    ProtocolInterface.prototype.CheckParam = function (Obj) {
        if (Obj === null || Obj === undefined || typeof Obj !== 'object')
            return false;
        // if (!Obj.hasOwnProperty('Type'))
        // 	return false;
        if (!Obj.hasOwnProperty('Type') || !Obj.hasOwnProperty('Func') || !Obj.hasOwnProperty('Param'))
            return false
        if (Obj.Type === null || Obj.Type === undefined || typeof Obj.Type !== 'number')
            return false;
        return true;
    };

    ProtocolInterface.prototype.downloadFile = function(obj) {
        env.log('interface','downloadFile',`${obj}`)
        _this.update.downloadFile(obj.UrlPath,obj.FilePath)
    }

    ProtocolInterface.prototype.ExportProfile = function (Obj) {
        env.log('Interface', 'ExportProfile', JSON.stringify(Obj));
        
        return new Promise(function (resolve) {
            fs.writeFileSync(Obj.Path, JSON.stringify(Obj.Data, null, "\t"));    
        
            resolve("ExportProfile Done");
        });

    };
    

    ProtocolInterface.prototype.UAinit= function() {
        env.log('Interface','UAInit','UAInit');
        return new Promise(function (resolve, reject) {
            // var screen = electron.screen.getPrimaryDisplay()
            // var size = screen.bounds, pointX = size.width, pointY = size.height;
            var uuid;
            _this.AppDB.getAppSetting().then(function (doc) {
                if (doc[0].uuid == undefined || !doc[0].hasOwnProperty('uuid') || doc[0].uuid == "") {
                    global.visitor = ua('UA-100425585-6');
                    uuid = global.visitor.cid;
                    doc[0].uuid = uuid;
                    _this.AppDB.saveAppSetting(doc[0]).then(function(res){})
                }
                else {
                    uuid = doc[0].uuid;
                    global.visitor = ua('UA-100425585-6', uuid);//谷歌统计
                }
                global.visitor.set('an', 'XPG');
                // global.visitor.set('sr', pointX + "x" + pointY);
                osLocale().then(locale => {
                    global.visitor.set('ul', locale);
                });
                global.visitor.set('av', doc[0].version);
                if (env.isMac)
                    global.visitor.set('ua', 'MacOS ' + env.osReleaseVer);
                else if (env.isWindows)
                    global.visitor.set('ua', 'Windows ' + env.osReleaseVer);
                UAflag = 1;
                resolve();
            });
        });
    }

    /**
    *    Dsc:        GA紀錄
    *    obj:        Func: Function FuncName
    *                Param: param 可有可無
    **/
    ProtocolInterface.prototype.GA = function(obj){
        console.log('GA '+JSON.stringify(obj))
        if(UAflag == 1){
            global.visitor.event(obj.Func, JSON.stringify(obj.Param), "XPG", 42, function (err) {
                if (err)
                    console.log('GA Error:'+err);
            });
            // global.visitor.pageview("/XPG", obj.obj.callbackValue, "XPG", function (err) {
            //     if (err)
            //         env.log(env.level.DEBUG, 'nedbClass', 'pageview', err)
            // });
        }
    }

    

    // //在关机，登出，登入时需要重新刷新HID设备
    // ProtocolInterface.prototype.OnSessionChange = function (changeType) {        
    //     env.log(env.level.DEBUG,'Interface','OnSessionChange',`Begin.`);
    //     try{
    //         if (env.isLessThenWin81){
    //             if(changeType === 0x2 || changeType === 0x4 || changeType === 0x6 || changeType === 0x8){
    // 				_this.CloseAllDevice();
    // 			}
    //             if (!_this.IsRefreshDevice){
    //                 clearTimeout(_this.RefreshDeviceWaitNextEventTimeoutId);
    //                 _this.RefreshAllDevice(3500);
    //             }
    //             env.log('Interface','OnSessionChange',`Send RefreshDevice event to UI`);                
    //         }
    //     }catch(ex){
    //         env.log(env.level.ERROR,'Interface','OnSessionChange',`ex :${ex.message}.`);
    //         _this.IsRefreshDevice = false;
    //     }
    // };



    //支援机种
    ProtocolInterface.prototype.SupportDevice = undefined;

    //是否拔插时正刷新设备列表
    ProtocolInterface.prototype.IsRefreshDevice = false;

    ProtocolInterface.prototype.AppDB = false;

    ProtocolInterface.prototype.update = false;
    //当前最前程序路径
    // ProtocolInterface.prototype.ForegroundAppPath = undefined;

    return ProtocolInterface;
})(events.EventEmitter);

exports.ProtocolInterfaceClass = ProtocolInterface;