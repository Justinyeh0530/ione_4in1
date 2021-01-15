'use strict';

var FuncName = {
    ExecFile: "ExecFile",
    //下載檔案
    downloadFile: "downloadFile",
	//设备初始化
    InitDevice : "InitDevice",
    //切換Profile
    ChangeProfileID: "ChangeProfileID",
    //確認AppVersion & download
    UpdateApp:"UpdateApp",
    //upzip AppUpdate File
    DownloadInstallPackage : "DownloadInstallPackage",
    UpdateFW : "UpdateFW",
    DownloadFWInstallPackage : "DownloadFWInstallPackage",
    ChangeWindowSize : "ChangeWindowSize",
    ShowWindow : "ShowWindow",
    RunApplication : "RunApplication" ,
    ExportProfile:"ExportProfile",
    ImportProfile:"ImportProfile",
    QuitApp:"QuitApp",
    GetBatteryStats:"GetBatteryStats",
    ReadFWVersion:"ReadFWVersion",
    Facebooklogin:"Facebooklogin",
    Googlelogin:"Googlelogin",
    Twitchlogin:"Twitchlogin",
    HideApp:'HideApp',
    MaxSize:'MaxSize',
    GA:'GA',
    DeleteMacroFunction : "DeleteMacroFunction",
};

var FuncType = {
    System : 0x01,
    Mouse : 0x02,
    Keyboard :0x03,
    Device : 0x04
};
var FuncKeyCode = [
    '', '', '', '','a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n','o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'n1', 'n2',
    'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n0','enter', 'esc', 'bksp', 'tab', 'space', 'minus', 'plus', 'lqu', 
    'rqu', 'k29', 'k42', 'sem', 'quo', 'period', 'comma', 'dot', 'qmark', 'caps', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6',
    'f7', 'f8', 'f9', 'f10', 'f11', 'f12', 'print','scroll', 'pause', 'insert', 'home', 'pup', 'delete', 'end', 'pdown', 'right', 
    'left', 'down', 'up', 'numlock', 'numdivide', 'nummulti', 'numminus', 'numplus', 'numenter', 'num1', 'num2', 'num3', 'num4', 'num5', 'num6', 'num7', 
    'num8', 'num9', 'num0','numdot', 'k45', 'book', 'keyboard power', 'keypad =', 'f13', 'f14', 'f15','f16', 'f17', 'f18', 'f19', 'f20',
    'f21', 'f22', 'f23', 'f24', '', '', '', '', '', '', '', '', '', '', '', '', 
    '', '', '', '', '', 'keypad', '', 'k14', 'k133', 'k56', 'k132', 'k131', '', '', '', '',
     
    'keyboard lang 1','', '', '', '', '', '', '', '', '', '', '', '', '', '', '',//0x90~0x9F
    '','', '', '', '', '', '', '', '', '', '', '', 'fn', '', '', '',//0xa0~0xaF
    '','', '', '', '', '', '', 'leftbutton', 'rightbutton', 'scrollbutton', '', '', 'ScrollDown', 'ScrollUp', '', '',//0xb0~0xbF
    '','', '', '', '', '', '', '', '', '', '', '', '', '', '', '',//0xc0~0xcF
    '','', '', '', '', '', 
    'M1_Scrollleft', 'M1_Scrollright', 'M2_Scrollleft', 'M2_Scrollright', '', '', '', '', '', '',//0xd0~0xdF
    'lctrl','lshift', 'lalt', 'win', 'rctrl', 'rshift', 'ralt', '', '', '', '', '', '', '', '', ''//0xe0~0xeF
    
];

var Func_SpecialKey =[

    "FUNC_LeftClick",
    "FUNC_RightClick",
    "FUNC_ScorllClick",
    "FUNC_DoubleClick",
    "FUNC_ScrollUp",
    "FUNC_ScrollDown",
    "FUNC_Tiltleft",
    "FUNC_Tiltright",
    "FUNC_VolumeDown",
    "FUNC_Volumeup",
    "FUNC_MuteVolume",
    "FUNC_MicUp",
    "FUNC_MicDown",
    "FUNC_MuteMic",
    "FUNC_MuteAll",
    "FUNC_Calculator",
    "FUNC_Mspaint",
    "FUNC_Notepad",
    "FUNC_SnippingTool",
    "FUNC_TaskManager",
    "FUNC_UserDict",
    "FUNC_DeskTop",
    "FUNC_Profile1",
    "FUNC_Profile2",
    "FUNC_Profile3",
    "FUNC_Profile4",
    "FUNC_Profile5",
    "FUNC_ProfileCycle"
];

exports.FuncName = FuncName;
exports.FuncType = FuncType;
exports.FuncKeyCode = FuncKeyCode;
exports.Func_SpecialKey = Func_SpecialKey;
//exports.Func_SpecialKey_Code = Func_SpecialKey_Code;