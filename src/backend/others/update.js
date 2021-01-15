
'use strict';
var AdmZip = require('adm-zip');
var events = require('events');
var env = require('./env');
var gUrl = require('url');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var evtType = require('./EventVariable').EventTypes;
var funcVar = require('./FunctionVariable');
var cp = require('child_process');
var os = require('os');
var request = require('request');
var AppData = require('./AppData');

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var UpdateClass = (function (_super) {
    __extends(UpdateClass, _super);
    var _this;
    function UpdateClass() {
        _this = this;     
        _super.call(this);  
        env.log('UpdateClass','UpdateClass','Begin...');
        try
        {

        }catch(e){
            throw new Error(e);
        }    
        _this.AppFileDownload = false;

    }

    var GetEventParamerObj = function (sn, func, param){
        var Obj = {
            Type : funcVar.FuncType.System,
            SN : sn,
            Func : func,
            Param : param
        };
        return Obj;
    };

    var GetExtFilePath = function (aPath, ext){
        var files = [];
        if(fs.existsSync(aPath)) {
            files = fs.readdirSync(aPath);
            for (var file of files){
                if (file.endsWith(ext)){
                    var curPath = path.join(aPath, file);
                    return curPath;
                }
            }
        }
    };  

    UpdateClass.prototype.UpdateApp = function () {
        env.log('UpdateClass','UpdateClass','UpdateApp');
        return new Promise(function(resolve,reject){
            try{
                if(env.isMac && fs.existsSync(os.tmpdir()+"/GSPYUpdate"))
                {
                    var Obj={
                        Type : funcVar.FuncType.System,
                        Func : evtType.UpdateApp,
                        Param : 0
                    };

                    _this.emit(evtType.ProtocolMessage, Obj);
                    return resolve();
                }
                else if(env.isWindows && fs.existsSync(os.tmpdir()+"\\"+"GSPYUpdate")){
                    var Obj={
                        Type : funcVar.FuncType.System,
                        SN : null,
                        Func : evtType.UpdateApp,
                        Param : 0
                    };

                    _this.emit(evtType.ProtocolMessage, Obj);
                    return resolve();
                }
                request.get(AppData.AppSettingData.UpdateUrl+'/UpdateApp.json',function(err, resp, body){
                    var body = JSON.parse(body);
                    if(body.hasOwnProperty('Version') && env.CompareVersion(AppData.AppSettingData.Version,body.Version)){
                        var fromFile;
                        var toFile; 
                        if(env.isWindows){
                            fromFile = AppData.AppSettingData.UpdateUrl+body.AppName.Win;
                            toFile = os.tmpdir()+"\\"+AppData.AppSettingData.ProjectName+".zip";
                        }
                        else{
                            fromFile = AppData.AppSettingData.UpdateUrl+body.AppName.Mac;
                            toFile = os.tmpdir()+"/"+AppData.AppSettingData.ProjectName+".zip";
                        }
                        _this.DownloadFileFromURL(fromFile, toFile, true).then(function(obj){
                            // _this.DownloadInstallPackage(function(){
                                env.log('UpdateClass','UpdateApp','DownloadFileFromURL success');

                                var Obj={
                                    Type : funcVar.FuncType.System,
                                    SN : null,
                                    Func : evtType.UpdateApp,
                                    Param : 0
                                };
            
                                _this.emit(evtType.ProtocolMessage, Obj);
                                
                                resolve();
                            // })
                        })
                    }else{
                        resolve();
                    }
                })

            }catch(ex){
                reject(ex);
            }
        });
    }

    UpdateClass.prototype.DownloadFileFromURL = function (url, dest, emitProgress) {   
        return new Promise(function (resolve, reject) {
            try{ 
                env.log('UpdateClass','DownloadFileFromURL',`Begin downloadFile:${url}      ${dest}`); 
                var isError = false;
                var preStep = 0, curStep = 0;
                var urlObj = gUrl.parse(url);
                var protocol = urlObj.protocol == 'https:' ? https : http;
                var opts;
                var req = null;
                if (_this.ProxyEnable){
                    opts = {
                        host: _this.ProxyHost,
                        port: _this.ProxyPort,
                        path: url,
                       // timeout:5000,
                        headers: {
							Host: urlObj.host
						}
                    };
                }else{
                    opts = url;
                }

                var file = fs.createWriteStream(dest);
                req = protocol.get(opts, function(response) {
                    var totalLen = parseInt(response.headers['content-length'], 10);
                    var cur = 0;            
                    file.on('finish', function() {
                      file.close(function(error, data){
                        if (!isError){
                            resolve({Data : dest});
                        }
                      });
                    });
                    if(emitProgress){
                        response.on("data", function(chunk) {
                            cur += chunk.length;
                            curStep = Math.floor(cur / totalLen *100);
                            if (preStep !== curStep){
                                preStep = curStep;
                                var Obj = GetEventParamerObj(null, evtType.DownloadProgress, {Current : cur,Total : totalLen});
                                _this.emit(evtType.ProtocolMessage, Obj);
                            }

                            if(_this.DownloadFileCancel) {
                                env.log('UpdateClass','DownloadFileFromURL',`User Cancel DownloadFile`); 
                                req.abort();
                                _this.DownloadFileCancel = false;
                            } 

                            if(_this.CheckDownloadTimeoutId != null)
                            {
                                clearTimeout( _this.CheckDownloadTimeoutId );
                                _this.CheckDownloadTimeoutId = null;
                            }

                            _this.CheckDownloadTimeoutId = setTimeout(function(){
                                env.log('UpdateClass','DownloadFileFromURL',`server is not responsed`);
                                
                                file.close(function(error, data){
                                    fs.unlink(dest, function(){
                                        var obj = {
                                            Error : 0x1008,
                                            Data : null
                                        };
                                        resolve(obj);

                                        req.abort();
                                        _this.DownloadFileCancel = false;
                                    }); 
                                });
                            }, 15000);
                        });
                        response.on("end", function(chunk) {

                            env.log('UpdateClass','DownloadFileFromURL',`get data end`);

                            // var Obj={
                            //     Type : funcVar.FuncType.System,
                            //     SN : null,
                            //     Func : evtType.UpdateApp,
                            //     Param : 0
                            // };

                            // _this.emit(evtType.ProtocolMessage, Obj);
                            
                            if(_this.CheckDownloadTimeoutId != null)
                            {
                                clearTimeout( _this.CheckDownloadTimeoutId );
                                _this.CheckDownloadTimeoutId = null;
                            }
                        });
                    }
                    response.pipe(file);
                }).on('error', function(err) {
                    isError = true;  _this.DownloadFileCancel = false;
                    env.log('Error','DownloadFileFromURL',`[downloadFile error:${err} url:${url}]`); 
                    file.close(function(error, data){
                        fs.unlink(dest, function(){
                            var obj = {
                                Error : 0x1008,
                                Data : err
                            };
                            resolve(obj);
                        }); 
                    });
                    var Obj = GetEventParamerObj(null, evtType.DownloadFileError, null);
                    _this.emit(evtType.ProtocolMessage, Obj);                    
                    if(_this.CheckDownloadTimeoutId != null)
                    {
                        clearTimeout( _this.CheckDownloadTimeoutId );
                        _this.CheckDownloadTimeoutId = null;
                    }
                });
            }catch(ex){ 
                env.log('Error','DownloadFileFromURL',`ex:${ex.message}`); 
                var obj = {
                            Error : 0x1008,
                            Data : err
                          };
                if(_this.CheckDownloadTimeoutId != null)
                {
                    clearTimeout( _this.CheckDownloadTimeoutId );
                    _this.CheckDownloadTimeoutId = null;
                }
                var Obj = GetEventParamerObj(null, evtType.DownloadFileError, null);
                _this.emit(evtType.ProtocolMessage, Obj);
                resolve(obj);
            }
        });
    };

    UpdateClass.prototype.DownloadInstallPackage = function (callback) {
        env.log('UpdateClass','UpdateClass','DownloadInstallPackage')
        try{
            var packPath = os.tmpdir()+"/"+AppData.AppSettingData.ProjectName+".zip";
            _this.DownloadFileCancel = false;
            env.log('UpdateClass','DownloadInstallPackage',`package:${packPath}`); 
            var pathExt = path.extname(packPath).toLowerCase();
            var dirName = path.join(path.dirname(packPath), 'GSPYUpdate');    
            if (fs.existsSync(dirName)){
                env.DeleteFolderRecursive(dirName, false);
            }else{
                fs.mkdirSync(dirName);
            }
            const {shell} = require('electron');
            if(env.isMac && pathExt === '.zip'){
                cp.execFile('/usr/bin/unzip',['-q','-o',packPath,'-d',dirName],[],function(err, stdout, stderr){
                    if(err != undefined && err != null){
                        env.log('Error','DownloadInstallPackage',`upzip error : ${err}`);
                    }
                    if(stderr != undefined && stderr != null){
                        env.log('Error','DownloadInstallPackage',`upzip error :`+stderr);
                    }
                    var baseName = GetExtFilePath(dirName, '.mpkg');
                    if (baseName === undefined){
                        baseName = GetExtFilePath(dirName, '.pkg');
                    }
                    if (baseName === undefined){
                        env.log('Error','DownloadInstallPackage',`Not found .mpkg file in:${dirName}`);
                        callback(0x1008);
                        return;
                    }
                    cp.execFile('/bin/chmod',['777',baseName],[],function(err, stdout, stderr){
                        if(err!=undefined && err!=null){
                            env.log('Error','DownloadInstallPackage',`chomd error:${err}`); 
                        }
                        if(stderr != undefined && stderr != null){
                            env.log('Error','DownloadInstallPackage',`chomd error:${stderr}`);
                        }
                        fs.unlink(packPath,function() {
                            env.log('UpdateClass','DownloadInstallPackage',`run insPack:${baseName}`);
                            shell.openItem(baseName);
                            callback();
                        });
                    });
                });
            }else if(env.isWindows && pathExt === '.zip'){
                try
                {   
                    var zip = new AdmZip(packPath);
                    zip.extractAllTo(dirName, true);
                    var baseName = GetExtFilePath(dirName, '.exe');
                    if (baseName === undefined){
                        env.log('Error','DownloadInstallPackage',`Not found .exe file in ${dirName}`);
                        callback(0x1008);
                        return;
                    }
                    fs.unlink(packPath,function () 
                    {
                        env.log('UpdateClass','DownloadInstallPackage',`run insPack:${dirName}`);
                        try
                        {
                            shell.openItem(baseName);
                        }catch(e){ 
                            env.log('Error','openItem error : ',e);
                        }                               
                        callback();
                    });
                }catch(e){
                    env.log('UpdateClass','openItem : ',e.toString());
                }    

            }
        }catch(ex){
            env.log('Error','DownloadInstallPackage',`ex:${ex.message}`);
            callback(0x1008);
        }
    };

    UpdateClass.prototype.UpdateFW = function () {
        env.log('UpdateClass','UpdateClass','UpdateFW');
        return new Promise(function(resolve,reject){
            try{
                if(env.isMac && fs.existsSync(os.tmpdir()+"/GSPYFWUpdate"))
                {
                    var Obj={
                        Type : funcVar.FuncType.System,
                        Func : evtType.UpdateFW,
                        Param : 0
                    };

                    _this.emit(evtType.ProtocolMessage, Obj);
                    return resolve();
                }
                else if(env.isWindows && fs.existsSync(os.tmpdir()+"\\"+"GSPYFWUpdate")){
                    var Obj={
                        Type : funcVar.FuncType.System,
                        SN : null,
                        Func : evtType.UpdateFW,
                        Param : 0
                    };

                    _this.emit(evtType.ProtocolMessage, Obj);
                    return resolve();
                }
                request.get(AppData.AppSettingData.UpdateUrl+'/UpdateApp.json',function(err, resp, body){
                    var body = JSON.parse(body);
                    if(body.hasOwnProperty('FWVersion') && env.CompareVersion(AppData.AppSettingData.FWVersion,body.FWVersion)){
                        var fromFile;
                        var toFile; 
                        if(env.isWindows){
                            fromFile = AppData.AppSettingData.UpdateUrl+body.FWName.Win;
                            toFile = os.tmpdir()+"\\"+AppData.AppSettingData.ProjectName+"FW.zip";
                        }
                        else{
                            fromFile = AppData.AppSettingData.UpdateUrl+body.FWName.Mac;
                            toFile = os.tmpdir()+"/"+AppData.AppSettingData.ProjectName+"FW.zip";
                        }
                        _this.DownloadFileFromURL(fromFile, toFile, true).then(function(obj){
                            // _this.DownloadFWInstallPackage(function(){
                                env.log('UpdateClass','UpdateApp','DownloadFileFromURL success');
                                var Obj={
                                    Type : funcVar.FuncType.System,
                                    SN : null,
                                    Func : evtType.UpdateFW,
                                    Param : 0
                                };
            
                                _this.emit(evtType.ProtocolMessage, Obj);

                                resolve();
                            // })
                        })
                    }else{
                        env.log('UpdateClass','UpdateApp','DownloadFileFromURL fail');
                        resolve();
                    }
                })

            }catch(ex){
                reject(ex);
            }
        });
    }


    UpdateClass.prototype.DownloadFWInstallPackage = function (callback) {
        env.log('UpdateClass','UpdateClass','DownloadInstallPackage')
        try{
            var packPath = os.tmpdir()+"/"+AppData.AppSettingData.ProjectName+"FW.zip";
            _this.DownloadFileCancel = false;
            env.log('UpdateClass','DownloadInstallPackage',`package:${packPath}`); 
            var pathExt = path.extname(packPath).toLowerCase();
            var dirName = path.join(path.dirname(packPath), 'GSPYFWUpdate');    
            if (fs.existsSync(dirName)){
                env.DeleteFolderRecursive(dirName, false);
            }else{
                fs.mkdirSync(dirName);
            }
            const {shell} = require('electron');
            if(env.isMac && pathExt === '.zip'){
                cp.execFile('/usr/bin/unzip',['-q','-o',packPath,'-d',dirName],[],function(err, stdout, stderr){
                    if(err != undefined && err != null){
                        env.log('Error','DownloadInstallPackage',`upzip error : ${err}`);
                    }
                    if(stderr != undefined && stderr != null){
                        env.log('Error','DownloadInstallPackage',`upzip error :`+stderr);
                    }
                    var baseName = GetExtFilePath(dirName, '.mpkg');
                    if (baseName === undefined){
                        baseName = GetExtFilePath(dirName, '.pkg');
                    }
                    if (baseName === undefined){
                        env.log('Error','DownloadInstallPackage',`Not found .mpkg file in:${dirName}`);
                        callback(0x1008);
                        return;
                    }
                    cp.execFile('/bin/chmod',['777',baseName],[],function(err, stdout, stderr){
                        if(err!=undefined && err!=null){
                            env.log('Error','DownloadInstallPackage',`chomd error:${err}`); 
                        }
                        if(stderr != undefined && stderr != null){
                            env.log('Error','DownloadInstallPackage',`chomd error:${stderr}`);
                        }
                        fs.unlink(packPath,function() {
                            env.log('UpdateClass','DownloadInstallPackage',`run insPack:${baseName}`);
                            shell.openItem(baseName);
                            callback();
                        });
                    });
                });
            }else if(env.isWindows && pathExt === '.zip'){
                try
                {   
                    var AdmZip = require('adm-zip');
                    var zip = new AdmZip(packPath);
                    zip.extractAllTo(dirName, true);
                    var baseName = GetExtFilePath(dirName, '.exe');
                    if (baseName === undefined){
                        env.log('Error','DownloadInstallPackage',`Not found .exe file in ${dirName}`);
                        callback(0x1008);
                        return;
                    }
                    fs.unlink(packPath,function () 
                    {
                        env.log('UpdateClass','DownloadInstallPackage',`run insPack:${dirName}`);
                        try
                        {
                            shell.openItem(baseName);
                        }catch(e){ 
                            env.log('Error','openItem error : ',e);
                        }                               
                        callback();
                    });
                }catch(e){
                    env.log('UpdateClass','openItem : ',e.toString());
                }    

            }
        }catch(ex){
            env.log('Error','DownloadInstallPackage',`ex:${ex.message}`);
            callback(0x1008);
        }
    };
    const { dialog } = require('electron')
    UpdateClass.prototype.downloadFile = function(url,Filepath) {
        global.UpdateFlag = true;
        env.log('update','downloadFile',`start donwload url:${url}`)
        return new Promise(function (resolve, reject) {
            try{
                var urlObj = gUrl.parse(url);
                var protocol = urlObj.protocol == 'https:' ? https : http;;
                let temptext;
                var Files = fs.createWriteStream(Filepath);
                var buffer = "";
                let request = protocol.get(url, {strictSSL: false,rejectUnauthorized: false}, function(response) {
                    var len = parseInt(response.headers['content-length'], 10);
                    var cur = 0;
                    var total = len / 1048576; //1048576 - bytes in  1Megabyte
                    
                    request.on("error", function(e){
                        env.log('update.js','downloadFile',`${e}`)
                        var Obj = GetEventParamerObj(null, evtType.DownloadProgress, {Current : 'downloadFile_Fail:'+`${e}`, Func: 'DownloadProgress'});
                        _this.emit(evtType.ProtocolMessage, Obj);                     
                        global.UpdateFlag = false;
                        resolve();
                        request.abort();
                    });
        
                    response.on("data", function(chunk) {
                        buffer += chunk;
                        cur += chunk.length;
                        temptext = "Downloading " + (100.0 * cur / len).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " mb\r" + ".<br/> Total size: " + total.toFixed(2) + " mb";
                        console.log(temptext);
                        let progress = (100.0 * cur / len).toFixed(0)
                        var Obj = GetEventParamerObj(null, evtType.DownloadProgress, {Current : progress, Func: 'DownloadProgress'});
                        _this.emit(evtType.ProtocolMessage, Obj);
                    });
        
                    response.on("end", function() {
                        temptext = "Downloading complete";
                        console.log(temptext)
                    });
                    response.pipe(Files);
                    Files.on('finish', function () {
                        Files.close(function (error, data) {
                            if(error) {
                                env.log('update.js','downloadFile',`${error}`)
                                var Obj = GetEventParamerObj(null, evtType.DownloadProgress, {Current : 'downloadFile_Fail', Func: 'DownloadProgress'});
                                _this.emit(evtType.ProtocolMessage, Obj);
                                resolve()
                                return;
                            }
                            var Obj = GetEventParamerObj(null, evtType.DownloadProgress, {Current : "Success", Func: 'DownloadProgress'});
                            if(Filepath.indexOf('.zip') != -1) {
                                try{
                                    let Zip = new AdmZip(Filepath);
                                    Zip.extractAllTo(env.appRoot+"\\data\\",true);
                                    _this.emit(evtType.ProtocolMessage, Obj);
                                }
                                catch(e) {

                                var AdmZipFail = GetEventParamerObj(null, evtType.DownloadProgress, {Current : 'downloadFile_Fail', Func: 'DownloadProgress'});
                                _this.emit(evtType.ProtocolMessage, AdmZipFail);
                                resolve()
                                return;
                                }
                            }
                            else 
                                _this.emit(evtType.ProtocolMessage, Obj);
                            resolve();
                        });
                    });
                    Files.on('error',() => {
                        var Obj = GetEventParamerObj(null, evtType.DownloadProgress, {Current : 'downloadFile_Fail', Func: 'DownloadProgress'});
                        _this.emit(evtType.ProtocolMessage, Obj);
                        resolve()
                    });
                }).on('error', function(err) {
                    env.log('update.js','downloadFile',`${err}`)
                    var Obj = GetEventParamerObj(null, evtType.DownloadProgress, {Current : 'downloadFile_Fail'+`${err}`, Func: 'DownloadProgress'});
                    _this.emit(evtType.ProtocolMessage, Obj);
                    global.UpdateFlag = false;
                    resolve();
                    request.abort();
                }).setTimeout(15000, function () {
                    env.log('update.js','downloadFile','timeout')
                    var Obj = GetEventParamerObj(null, evtType.DownloadProgress, {Current : 'downloadFile_Fail', Func: 'DownloadProgress'});
                    _this.emit(evtType.ProtocolMessage, Obj);
                    global.UpdateFlag = false;
                    resolve();
                    request.abort();
                });
            } catch(e) {
                env.log('update','downloadFile',`err:${e}`)
                resolve()
            }
        });
    }
    
    return UpdateClass;

})(events.EventEmitter);

exports.UpdateClass = UpdateClass;