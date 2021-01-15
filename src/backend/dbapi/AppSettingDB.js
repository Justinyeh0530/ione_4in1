var Node_NeDB = require('./Node_NeDB'); 
var env = require('../others/env');
var AppSettingDB = (function (){
    var _this; 
    function AppSettingDB() {
      	_this = this;
        _this.Node_NeDB =Node_NeDB.DB.getInstance(); 
    }

    AppSettingDB.prototype.getAppSetting = function(){
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.queryCmd('AppSettingDB',{},function(docs){  
                resolve(docs);     
            });  
        });
    };

    AppSettingDB.prototype.saveAppSetting = function(obj){
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.updateCmd('AppSettingDB',{"_id":"5Cyd2Zj4bnesrIGK"},obj,function(docs){  
                resolve(docs);     
            });  
        });
    };



    AppSettingDB.prototype.DB = undefined;  
  
    return AppSettingDB;  

})()

exports.AppSettingDB = AppSettingDB;