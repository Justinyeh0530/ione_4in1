var Node_NeDB = require('./Node_NeDB'); 
var env = require('../others/env');
var MacroDB = (function (){
    var _this; 
    function MacroDB() {
      	_this = this;
        _this.Node_NeDB =Node_NeDB.DB.getInstance(); 
    }

    MacroDB.prototype.getMacro = function(){
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.queryCmd('MacroDB',{},function(docs){  
                resolve(docs);     
            });  
        });
    };
    

    MacroDB.prototype.insertMacro = function(obj, callback){
        _this.Node_NeDB.insertCmd('MacroDB',obj,function(mds){
            callback(mds);
        });
    };
    
    MacroDB.prototype.getMacroById = function(value){
        var data = {value:value};
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.queryCmd('MacroDB',data,function(docs){  
                resolve(docs);     
            });  
        });
    };


    MacroDB.prototype.updateMacro = function(value, obj){
        var data = {value:value};
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.updateCmd('MacroDB',data,obj,function(docs){  
                resolve(docs);     
            });  
        });
    };

    MacroDB.prototype.DeleteMacro = function(value){
        var obj = {value:value};
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.deleteCmd('MacroDB',obj,function(docs){  
                resolve(docs);     
            });  
        });
    };



    MacroDB.prototype.DB = undefined;  
  
    return MacroDB;  

})()

exports.MacroDB = MacroDB;