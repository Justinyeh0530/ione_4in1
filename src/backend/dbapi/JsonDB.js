var env = require('../others/env');
var fs = require('fs');
var JsonDB = (function (){
    var _this; 
    function JsonDB() {
      	_this = this;
    }

    JsonDB.prototype.GetProfile = function(filename){
        // return new Promise(function (resolve, reject) {
        //     return  _this.DB.queryCmd(filename,obj,function(docs){  
        //         resolve(docs);     
        //     });  
        // });

        var Data = [];
        return new Promise(function (resolve) {
            
            fs.exists(filename, function (bexists) 
            {
                if (bexists) 
                {
                    fs.readFile(filename,'utf8', function (err,data){
                        if (err)throw err;
                        Data = JSON.parse(data);
                    
                        resolve(Data);
                    });
                } 
                else 
                {
                    resolve(Data);
                }
    
            });

        });

    };

    JsonDB.prototype.SetProfile = function(filename, obj){
        // return new Promise(function (resolve, reject) {
        //     var data={id:id}
        //     return  _this.DB.updateCmd(filename,data,obj,function(docs){  
        //         resolve(docs);     
        //     });  
        // });
        
        return new Promise(function (resolve) {
            fs.writeFileSync(filename, JSON.stringify(obj, null, "\t"));    
        
            resolve("JsonDB SetProfile Done");
        });
    };
    JsonDB.prototype.DB = undefined;  
  
    return JsonDB;  

})()

exports.JsonDB = JsonDB;