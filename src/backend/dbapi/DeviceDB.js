var Node_NeDB = require('./Node_NeDB'); 
var env = require('../others/env');

var DeviceDB = (function (){
    var _this; 
    function DeviceDB() {
      	_this = this;
        _this.Node_NeDB =Node_NeDB.DB.getInstance(); 
    }

    DeviceDB.prototype.getSupportDevice = function(){
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.queryCmd('SupportDevice',{},function(docs){  
                resolve(docs);     
            });  
        });
    };

    DeviceDB.prototype.updateDevice = function(sn, obj, callback){
        return new Promise(function (resolve, reject) {
            var data={SN:sn};
            return  _this.Node_NeDB.updateCmd('DeviceDB',data,obj,function(docs){  
                resolve(docs);     
            });  
        });
    };



    DeviceDB.prototype.getDefultProfile = function(vid, pid) {
        return new Promise(function (resolve, reject) {
            var obj = {vid:vid, pid:pid}
            return  _this.Node_NeDB.queryCmd('SupportDevice',obj,function(docs){  
                resolve(docs[0]);     
            });  
        });
    }


    DeviceDB.prototype.getDevice = function(sn){
        var obj = {SN: sn}
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.queryCmd('DeviceDB',obj,function(docs){  
                resolve(docs[0]);     
            });  
        });
    };

    DeviceDB.prototype.getAllDevice = function(){
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.queryCmd('DeviceDB',{},function(docs){  
                console.log('DeviceDB.prototype.getAllDevice', docs);
                resolve(docs);     
            })
              
        });
    };

    DeviceDB.prototype.AddDevice = function(obj, callback){
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.insertCmd('DeviceDB',obj,function(docs){  
                resolve(docs);     
            });  
        });
    };

    DeviceDB.prototype.updateDevice = function(sn, obj, callback){
        return new Promise(function (resolve, reject) {
            var data={SN:sn};
            return  _this.Node_NeDB.updateCmd('DeviceDB',data,obj,function(docs){  
                resolve(docs);     
            });  
        });
    };



    DeviceDB.prototype.DB = undefined;  
  
    return DeviceDB;  

})()

exports.DeviceDB = DeviceDB;