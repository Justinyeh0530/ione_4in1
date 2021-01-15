let debug = require('../../package.json')
let UpdateUrl = ""
if (debug.BuildCode)
    UpdateUrl = 'https://sfo2.digitaloceanspaces.com/gloriouscore-test/Glorious_Core/Version.json'
else {
    UpdateUrl = 'https://gloriouscore.nyc3.digitaloceanspaces.com/Glorious_Core/Version.json'
}
function getUpdateUrl() {
    return UpdateUrl
}
exports.getUpdateUrl = getUpdateUrl;