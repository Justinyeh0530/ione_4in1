'use strict';

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var DBstore = require('nedb');
var path = require('path');
var lockFile = require('lockfile')
var env = require('../others/env');



var DB = (function () 
{   
    var _this; 
    function DB() {
      	_this = this;
        _this.db = {};   
        lockFile.unlockSync('MacroDB');
        lockFile.unlockSync('DeviceDB');
        lockFile.unlockSync('AppSettingDB');
        lockFile.unlockSync('PluginDB');
        
    }   
    //DB.getInstance=0;
    DB.getInstance= function () {
        if (this.instance) {
            return this.instance;
        } else {
            console.log("new Node_NeDB Class");
            this.instance = new DB();
            return this.instance;
        }
    }

    
    DB.prototype.getMax = function (tbname, onFind) {
        var db = _this.getDB(tbname);
        db.find({}).sort({ value: -1 }).limit(1).exec(function (err, docs) {
            if (docs !== undefined && docs.constructor === Array && docs.length > 0) {
                onFind(err, docs[0].value);
            }
            else {
                onFind(err, 1);
            }
        });
    }

    
    DB.prototype.queryCmd = function (filePath,query_partemter, callback) {
        lockFile.unlockSync(filePath);
        var db = _this.getDB(filePath);
        var opts = { stale: 500 };
        lockFile.check(filePath, (error, isLocked) => {
            //console.error('DB.prototype.queryCmd-lock',filePath, error, isLocked,db);
            if (error) {
                console.error('DB.prototype.queryCmd.er',filePath,opts,error);
                env.log(env.level.ERROR, 'queryCmd', 'lockFile', error);
                // throw er;/;
            }

            db.find(query_partemter, function (err, docs) {
                callback(docs);
            });      
        });
        

    };
    DB.prototype.showlog= function (message){
        console.log('DB.prototype.showlog_',message);
    }
    DB.prototype.insertCmd = function (tbname, m, callback) {
        var opts = { retries: 5, retryWait: 100 }
        lockFile.lock(tbname, opts, function (er) {
            if (er)
                env.log(env.level.ERROR, 'insertCmd', 'lockFile', er);

            var db = _this.getDB(tbname); var newIndex = 0;
            _this.getMax(tbname, function (err, maxValue) {
                if (maxValue == undefined) {
                    newIndex = 1;
                } else {
                    newIndex = maxValue + 1;
                }
                if (m["value"] == null)
                    m["value"] = newIndex;
                db.insert(m, function (err, docs) {
                    db.persistence.compactDatafile();
                    lockFile.unlock(tbname, function (er) {
                        callback(err, docs);
                    })
                });
            });
        });
    };

    DB.prototype.updateCmd = function (filePath, targetId , specifyfield, callback) {
        var db = _this.getDB(filePath);
        var opts = { retries: 5, retryWait: 100 }
        lockFile.check(filePath, (error, isLocked) => {
            if (error) {
                console.error('DB.prototype.updateCmd_error',filePath,opts,er);
                env.log('updateCmdERROR', 'updateCmd', 'lockFile', er);
                // throw er;
            }
            db.update(targetId, { $set: specifyfield }, { upsert: true, multi: true }, function (err, numReplaced) {
                if(err)
                    console.error('DB.prototype.updateCmd_lockFile.unlock',err);
                db.persistence.compactDatafile();
                lockFile.unlock(filePath, function (er) {
                    callback(err);
                })
            });
        });
    };

    DB.prototype.updateDataCmd = function (tbname, om, nm, callback) {
        var db = _this.getDB(tbname);
        var opts = { retries: 5, retryWait: 100 }
        lockFile.lock(tbname, opts, function (er) {
            if (er){
                console.error('DB.prototype.updateDataCmd_ER',tbname,opts,er);
                env.log(env.level.ERROR, 'updateDataCmd', 'lockFile', er);
            }
            db.update(om, { $push: nm }, { multi: true }, function (err, numReplaced) {
                db.persistence.compactDatafile();
                console.error('DB.prototype.updateDataCmd_ER',tbname,opts,err);
                lockFile.unlock(tbname, function (er) {
                    callback(err);
                })
            });
        });
    };

    DB.prototype.deleteCmd = function (tbname, m, callback) {
        var db = _this.getDB(tbname);
        var opts = { retries: 5, retryWait: 100 }
        lockFile.lock(tbname, opts, function (er) {
            if (er){
                env.log(env.level.ERROR, 'deleteCmd', 'lockFile', er);
                console.error('DB.prototype.deleteCmd',tbname,opts,er);
            }

            db.remove(m, { multi: true }, function (err, numRemoved) {
                db.persistence.compactDatafile();
                lockFile.unlock(tbname, function (er) {
                    callback(err);
                })
            });
        });
    };

    DB.prototype.ensureIndex = function (tbname, _fieldName, callback) {
        var db = _this.getDB(tbname);
        db.ensureIndex({ fieldName: _fieldName, unique: true, sparse: true }, function (err) {
            callback(err);
        });
    }

    DB.prototype.getDB = function (tbname) {
        try{
            if (_this.db[tbname]) {
                _this.db[tbname].loadDatabase();
                return _this.db[tbname]
            } else {
                var dbPath = path.resolve(__dirname, '../../data/' + tbname + ".db");
                dbPath = env.appDBRoot + tbname + ".db";//APPDATA DB
                var thisDb = new DBstore({ filename: dbPath, corruptAlertThreshold: 1 });
                thisDb.loadDatabase();
                _this.db[tbname] = thisDb;
                return thisDb;
            }
        }
        catch (e) {
            console.error('DB.prototype.getDB',e,tbname);
        }
    }



   DB.prototype.db = undefined; 

   return DB;
})();

exports.DB = DB;