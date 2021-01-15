var fs = require('fs');

/**
*   @data 儲存資料
*   @path 儲存位置
*/
function SaveFile(filename, data, path, callback,version) {
    finaldata = {
        filename: filename,
        version:version,
        value: data
    }
    fs.writeFile(path, JSON.stringify(finaldata), function(err, data){
        if(err)
            callback(err, data)
        else
            callback(err,true)
    })
}

exports.SaveFile = SaveFile;





function SupportSaveFile(data, path, callback) {
    fs.writeFile(path, JSON.stringify(data), function(err, data){
        if(err)
            callback(err, data)
        else
            callback(err,true)
    })
}
exports.SupportSaveFile = SupportSaveFile;









/**
*   @path 檔案位置
*/
function OpenFile(path, callback) {
    fs.readFile(path, function(err,data){
        if(err)
            callback(err, data)
        else
            callback(err, data.toString());
    })
}

exports.OpenFile = OpenFile;