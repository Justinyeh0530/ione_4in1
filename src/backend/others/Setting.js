let debug = require('../../package.json')
let UpdateUrl = ""
if (debug.BuildCode)
    UpdateUrl = ''
else {
    UpdateUrl = ''
}
function getUpdateUrl() {
    return UpdateUrl
}
exports.getUpdateUrl = getUpdateUrl;