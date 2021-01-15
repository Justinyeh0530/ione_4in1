var Node_NeDB = require('./Node_NeDB'); 
var env = require('../others/env');

var ApModeDB = (function (){
    var _this; 
    function ApModeDB() {
      	_this = this;
        _this.Node_NeDB =Node_NeDB.DB.getInstance(); 
    }

    ApModeDB.prototype.updateApMode = function(data){
        return new Promise(function (resolve, reject) {
            var obj = {_id: 'APMode'}
            return  _this.Node_NeDB.updateCmd('APModeDB',obj,data,function(docs){  
                resolve(docs);     
            });  
        });
    };


    ApModeDB.prototype.getApMode = function(){
        var obj = {_id: 'APMode'}
        return new Promise(function (resolve, reject) {
            return  _this.Node_NeDB.queryCmd('APModeDB',obj,function(docs){  
                resolve(docs[0]);     
            });  
        });
    };

    ApModeDB.prototype.DB = undefined;  
  
    return ApModeDB;  

})()

exports.ApModeDB = ApModeDB;