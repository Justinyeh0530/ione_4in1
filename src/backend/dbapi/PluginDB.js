var Node_NeDB = require('./Node_NeDB'); 
var env = require('../others/env');
var PluginDB = (function (){
    var _this; 
    function PluginDB() {
      	_this = this;
        _this.Node_NeDB =Node_NeDB.DB.getInstance(); 
    }

    PluginDB.prototype.getPluginDevice = function(){
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.queryCmd('PluginDB',{},function(docs){  
                if(docs !== undefined && docs.constructor === Array && docs.length > 0) 
                    resolve(docs);
                else
                    resolve(undefined);     
            });  
        });
    };

    PluginDB.prototype.updatePluginDevice = function(obj){
        var id = {id:1};
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.updateCmd('PluginDB',id,obj,function(docs){  
                resolve(docs);     
            });  
        });
    };

    PluginDB.prototype.updateAllPluginDevice = function(obj) {
        return new Promise(function (resolve, reject) {
            _this.Node_NeDB.queryCmd('PluginDB',{},function(docs){  
                var q = {Keyboard:obj.Keyboard, Mouse:obj.Mouse, Headset:obj.Headset}     
                var id = {id:1}
                _this.Node_NeDB.updateCmd('PluginDB',id,q,function(docs){  
                    resolve(docs);     
                });  
            });  
        });
    }

    PluginDB.prototype.DB = undefined;  
  
    return PluginDB;  

})()

exports.PluginDB = PluginDB;