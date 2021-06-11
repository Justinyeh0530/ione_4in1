var env = require('./backend/others/env');
var funcVar = require('./backend/others/FunctionVariable');
var path = require('path');
var evtVar = require('./backend/others/EventVariable').EventTypes;
var AppObj = require("./backend/dbapi/AppDB");
var packagejson = require('./package.json')
// 应用控制模块
const electron = require('electron');
const app = electron.app;
const {Menu,Tray,ipcMain,globalShortcut,session} = require('electron');
global.LoginData={};
global.ServerStatus = 0;
global.ChangeProfileLayerFlag = false;

global.visitor;//谷歌统计

process.on('uncaughtException', function (err) {
    env.log('electron', 'uncaughtException', err);
    return (function () {
        env.log('electron', 'uncaughtException', err);
        if (err.stack) {
            env.log('electron', 'uncaughtException stack', err.stack);
        }
    });
});

// 创建窗口模块
const BrowserWindow = electron.BrowserWindow;

// 主窗口
var mainWindow;

app.commandLine.appendSwitch('--ignore-gpu-blacklist');

// 初始化并准备创建主窗口
app.on('ready', function () {
    env.log('Main','Main','Ready');
    var _initDev = false;  
    //-------------------------------
    var commands = process.argv;
    env.log('Main','commands',commands); // output : ["argv1", "argv2"]    
});


var windows = require('./windows');
var cp = require('child_process');
var fs = require('fs');
const ipc = electron.ipcRenderer;
var net = require('net');
var ProtocolInterface = require('./backend/protocol/Interface');


var isAppReady = false;
app.once('ready', function () { return isAppReady = true; });
function onAppReady(cb) {
    if (isAppReady) {
        cb();
    }
    else {
        app.once('ready', cb);
    }
}

var Smart = (function () {
    var _this;
    function Smart(opts) {
        env.log('electron','Smart','New Smart INSTANCE.');     
         
        _this = this;

        if (opts.closeApp){
            //app.terminate();
            app.quit();
            return;
        }
        _this.registerListeners();
        _this.startRunningInstanceListener();

        global.EnvVariate = env;  
        global.CanQuit = true;   
        global.MainWindow = new windows.SmartWindowClass();
        var windowsizeflag = 0;
        
        _this.AppDB = AppObj.getInstance();

        global.MainWindow.on('finish-load', function (isCrashed) {   
            env.log('electron','Smart','New Smart INSTANCE.');     
            global.MainWindow.win.setSkipTaskbar(false);
            _this._initDev = false;         
            if(global.AppProtocol !== undefined){
                // _this.initDevice();
            }else{
                global.AppProtocol = new ProtocolInterface.ProtocolInterfaceClass();
                // _this.initDevice();
            }
            global.AppProtocol.on(evtVar.ProtocolMessage, function(obj){
                try{
                    if(obj.Func == "ShowWindow"){
                        if(obj.Param =="Hide"){
                            // global.MainWindow.win.setSize(1 , 1);
                            global.MainWindow.win.minimize();
                        }
                        if(obj.Param =="Close"){
                            env.log('electron','ShowWindow',JSON.stringify(obj.Param));
                            global.MainWindow.win.hide();
                        }
                    }else if(obj.Func == "QuitApp") {
                        global.CanQuit = true;
                        app.quit();
                    }else if(obj.Func == "HideApp"){
                        // global.CanQuit = true;
                        // app.hide();
                        global.MainWindow.win.minimize();
                        // return app.terminate(); 
                    }
                    var t = {Func:obj.Func,Param:obj.Param};
                    // console.log(JSON.stringify(t));
                    global.MainWindow.win.webContents.executeJavaScript(`window.dispatchEvent(new CustomEvent('icpEvent', {'detail':'${JSON.stringify(t)}'}));`);
                }catch(e){
                    env.log('electron','AppProtocol','error:'+e)
                }
			});
            if (isCrashed === null || isCrashed === undefined || !isCrashed){
                if (!opts.noShow){//ShowWindow
                    global.CanQuit = false;

                    var commands = Array.prototype.slice.call(process.argv,1); 
                    //var commands = process.argv;
                    env.log('Main','commands',commands); // output :
                    _this.AppDB.getAppSetting().then(function (doc) {
                        if (commands[0] == '--hide') {                   
                            if (doc[0].startup) {
                                if(doc[0].minimize)
                                    global.MainWindow.win.hide();
                                else
                                    global.MainWindow.win.show();
                            } else {
                                global.CanQuit = true;
                                return app.quit();
                            }
                        } 
                        else if (commands[0] == '--forcehide') {     
                            global.MainWindow.win.hide();
                        } 
                        else 
                        {
                            if(doc[0].minimize)
                                global.MainWindow.win.hide();
                            else
                                global.MainWindow.win.show();
                        }
                    });

                }else{
                    if (env.isMac)
                        app.dock.hide();
                    global.CanQuit = true;
                }
            }
        }); 
        global.MainWindow.load();
        //
        if(global.AppProtocol === undefined)
            global.AppProtocol = new ProtocolInterface.ProtocolInterfaceClass();   
    }
    
    Smart.startup = function (opts) {
        if (!!Smart.INSTANCE) {
            throw new Error('Can only ever have one instance at the same time');
        }
        Smart.INSTANCE = new Smart(opts);
    };

    Smart.prototype.registerListeners = function () {
        app.on('will-quit', function () {
            env.log('electron','Smart','App#will-quit: deleting running instance handle');
            env.DeleteLogFile();
            _this.deleteRunningInstanceHandle(); 
            globalShortcut.unregister('ctrl+i'); 
            // globalShortcut.unregister('ctrl+r'); 
            globalShortcut.unregisterAll();              
        });
        app.on('activate-with-no-open-windows', function(){
            if (env.isMac && global.MainWindow !== undefined){
                app.dock.show();
                global.CanQuit = false;
                global.MainWindow.win.show();
            }
        });
        
        app.on('activate',function(){
            global.MainWindow.win.setSize(env.winSettings.width , env.winSettings.height);
            global.MainWindow.win.setSkipTaskbar(true);
        })

        app.on('browser-window-blur',function(){
            // global.MainWindow.win.setSize(env.winSettings.width , env.winSettings.height);
        })

        app.on('browser-window-focus',function(){
            // global.MainWindow.win.setSize(env.winSettings.width , env.winSettings.height);
        })

        app.on('gpu-process-crashed', function(){
            env.log('electron','main','App#gpu-process-crashed.');
        });

        ipcMain.on("Open", function (event, labs){ 
            _this.installTray(labs);        
        });

        ipcMain.on("customHyper_Link", function (event,parameter){ 
            env.log('electron','進入瀏覽器指定URL',parameter);
            //const shell = require('electron').shell;
            //shell.openExternal("")
            cp.execSync('start '+parameter);
        });
    };

    Smart.prototype.installTray = function (labs) { 
        if (labs === null || labs === undefined || labs.constructor !== Array || labs.length !== 2)
            labs = ['Open','Exit'];
        if (global.TrayIcon !== undefined){
            global.TrayIcon.destroy();
            global.TrayIcon = null;
        }

        global.TrayIcon = new Tray(path.join(__dirname,'image/trayicon.png')); 
        var contextMenu = Menu.buildFromTemplate(
            [
                { 
                    label: labs[0],
                    icon:path.join(__dirname,'image','topmost.png'),
                    click:function(event){
                        if (env.isMac)
                            app.dock.show();
                        console.log(event);
                        global.CanQuit = false;
                        global.MainWindow.win.show();
                        global.MainWindow.win.setSkipTaskbar(false);
                    }
                },
                {
                    label: labs[1],
                    icon:path.join(__dirname,'image','exit.png'),
                    click:function(){
                        global.CanQuit = true;
                        global.AppProtocol.CloseAllDevice().then(function () {
                            app.quit();
                        });
                    }
                } 
            ]
        );      
        global.TrayIcon.setTitle(packagejson.project.tray.title);
        global.TrayIcon.setToolTip(packagejson.project.tray.tooltip);
        global.TrayIcon.setContextMenu(contextMenu);
        //在tray icon上點擊雙鍵所做的動作
        global.TrayIcon.on('double-click', function(){
            if (env.isMac)
                app.dock.show();
            global.CanQuit = false;
            global.MainWindow.win.show() ;
            
            setTimeout(function(){
                global.MainWindow.win.setSkipTaskbar(false);
            },100);
        });

        //在tray icon上點擊右鍵所做的動作
        global.TrayIcon.on('right-click', function(){
            if (env.isMac)
                app.dock.show();
            global.CanQuit = false;
        }); 
    };

    Smart.prototype.alarmNotifyWindowClearCloseTime = function () {
        if (_this.alarmcloseNofifyWindowTimeId !== undefined){
            clearTimeout(_this.alarmcloseNofifyWindowTimeId);
            _this.alarmcloseNofifyWindowTimeId = undefined;
        }
    };

    Smart.prototype.NotifyWindowSetCloseTime = function () {
        if (_this.closeNofifyWindowTimeout > 0 && _this.notifyWindow !== null && _this.notifyWindow !== undefined){
            _this.closeNofifyWindowTimeId = setTimeout(function() {
                _this.notifyWindow.close();
                _this.closeNofifyWindowTimeId = undefined;
            }, _this.closeNofifyWindowTimeout);
        }
    };
    
    Smart.prototype.initDevice = function () {
        if(!_this._initDev){
            _this._initDev = true;
            var Obj={
                Type:funcVar.FuncType.System,
                Func:funcVar.FuncName.InitDevice,
                Param:null
            };
            global.AppProtocol.RunFunction(Obj, function (error,data){
                try
                {
                    global.MainWindow.win.webContents.send('InitDevice');
                    env.log('electron','InitDevice callback',error);
                }catch(ex){
                    env.log('Error','main',`AppProtocol.InitDevice Error : ${ex}`);
                }
            });
        }
    };

    Smart.prototype.GA = function(Func, Param) {
        console.log('electron GA')
        var ParamObj = {
            Func: Func,
            Param: Param
        }

        var Obj={
            Type: funcVar.FuncType.System,
            Func: funcVar.FuncName.GA,
            Param: ParamObj
        };

        global.AppProtocol.RunFunction(Obj, function (error,data){
        });
    }
    
    Smart.prototype.startRunningInstanceListener = function () {
        // We are the one to own this
        _this.deleteRunningInstanceHandle();
        // Listen to other instances talking to us
        var runningInstance = net.createServer(function (connection) {
            connection.on('data', function (data) {
                try{
                    var otherInstanceArgs = data.toString().toLowerCase();
                    env.log('electron','Received data from other instance', otherInstanceArgs);
                    if(otherInstanceArgs.startsWith('reopen')){
                        //----------------------------------------
                        //env.log('electron','Received data from other instance', 'reopen1');
                        if (env.isMac)
                        {
                            app.dock.show();
                        }
                        else
                        {
                            //global.MainWindow.win.setSize(env.winSettings.width , env.winSettings.height);
                            //console.log(event);
                            global.CanQuit = false;
                            global.MainWindow.win.show();
                            global.MainWindow.win.setSkipTaskbar(false);
                        }
                        //----------------------------------------

                    }else if(otherInstanceArgs.startsWith('closeapp')){
                        setTimeout(function () {
			                global.CanQuit = true;
                            //return app.terminate(); 
                            return app.quit(); 
			            }, 0); 
                    }
                }catch(ex){
                    env.log('Error','startRunningInstanceListener',`Smart.connection#data : ${ex.message}`);
                }
            });
        });
        runningInstance.listen(env.runningInstanceHandle);
        // This can happen when multiple apps fight over the same connection
        runningInstance.on('error', function (error) {
            env.log('Error','startRunningInstanceListener','Terminating because running instance listener failed:', error.toString());
            setTimeout(function () {
                global.CanQuit = true;
                return app.quit(); //app.terminate();
                
            }, 0); // we cannot allow multiple apps, so we quit
        });
    };
    
    Smart.prototype.deleteRunningInstanceHandle = function () {
        if (env.isWindows) {
            return;
        }
        if (fs.existsSync(env.runningInstanceHandle)) {
            try {
                return fs.unlinkSync(env.runningInstanceHandle);
            }
            catch (e) {
                if (e.code !== 'ENOENT') {
                    env.log('Error','deleteRunningInstanceHandle','Fatal error deleting running instance handle', e);
                    throw e;
                }
            }
        }
    };
    
    Smart.prototype._initDev = false;
    return Smart;
})();

function main() {

    // app.commandLine.appendSwitch('--disable-gpu'); 
    app.commandLine.appendSwitch(' --enable-logging');
    app.commandLine.appendSwitch('touch-events', 'enabled');
    app.commandLine.appendSwitch("--disable-http-cache");
    //讓Audio可以在開啟App時就可以撥放, 避免Google的Audio Policy
    app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
    //避免記憶體一直增加
    app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512');


    // Ready for creating browser windows
    onAppReady(function () 
    {
        var args = Array.prototype.slice.call(process.argv, 1);
        var opts = args.filter(function (a) { return /^-/.test(a); })
                        .map(function (a) { return a.replace(/^-*/, ''); })
                        .reduce(function (r, a) {  r[a] = true;  return r; }, {});
        // On Mac/Unix we can rely on the server handle to be deleted if the instance is not running
        if (!env.isWindows && !fs.existsSync(env.runningInstanceHandle)) {
            env.log('electron','main','Mac/Linux: starting smart because handle does not exist');
            Smart.startup(opts);
        }
        else { 
                    env.log('electron','main'," runningInstanceHandle: "+env.runningInstanceHandle);
                    env.log('electron','main',JSON.stringify(opts));
                    var con = net.connect({
                        path: env.runningInstanceHandle
                    }, function () {
                        // Another instance is running, we talk to it and ask it to open a window
                        var msg = opts.closeApp ? 'closeApp' : 'ReOpen';
                        con.write(msg, function () {
                            con.end();
                            env.log('electron','main','Sending args to running instance and terminating');
                            setTimeout(function () {
                                global.CanQuit = true;
                                // return app.terminate(); 
                                return app.quit();
                            }, 0); // terminate later to prevent bad things from happen
                        });
                    });
                    con.on('error', function (error) {
                        env.log('electron','main','No instance running,Starting smart.'+error);
                        Smart.startup(opts);
                    }); 
            }
            
            if(fs.existsSync(process.env.APPDATA + "\\GSPYTEST.TEST")) {
                var ret = globalShortcut.register('ctrl+i', function () {
                    global.MainWindow.win.toggleDevTools();
                });
            };
        });
}
// On Darwin, the PATH environment will not be correctly set when double clicking
// the application. Need to fix it up before anything starts up.
function fixUnixEnvironment(cb) {
    var didReturn = false;
    var done = function () {
        if (didReturn) {
            return;
        }
        didReturn = true;
        cb();
    };
    var child = cp.spawn(process.env.SHELL, ['-ilc', 'env'], {
        detached: true,
        stdio: ['ignore', 'pipe', process.stderr],
    });
    child.stdout.setEncoding('utf8');
    child.on('error', done);
    var buffer = '';
    child.stdout.on('data', function (d) {
        buffer += d;
    });
    child.on('close', function (code, signal) {
        if (code !== 0) {
            return done();
        }
        var hash = Object.create(null);
        buffer.split('\n').forEach(function (line) {
            var p = line.split('=', 2);
            var key = p[0];
            var value = p[1];
            if (!key || hash[key]) {
                return;
            }
            hash[key] = true;
            process.env[key] = value;
        });
        done();
    });
}
if (env.isMac || env.isLinux) {
    fixUnixEnvironment(main);
}
else {
    main();
}