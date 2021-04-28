# 

Allen NeW JeNkInS tEsT

環境:
nodejs: 10.17.0
electron: 4.0.4


打包:
先移到APP資料夾裡: cd app

x64:electron-packager ./ projectname --platform=win32 --arch=x64 --electron-version=4.0.0 --icon=./image/icon.ico

安裝包說明:
1.將打包後的IONE_ACTION_AIO-win32-x64 裡面的所有檔案COPY到IONE_ACTION_AIO_SETUP\Files資料夾內
2.打開ione_3in1setup.iss
3.點選compile(熱鍵Ctrl+F9)
4.在IONE_ACTION_AIO_SETUP\Setup資料夾看見安裝檔

P.S: 如果要取代FILE裡面的檔案 記得GetOSVer.dll跟icon.ico不要刪掉

加入ColorPicker:
1. npm i --save angular2-color-picker
2. 把node_modules/angular2-color-picker資料夾 複製到app的node_modules/
3. 在app.module.ts :
import {ColorPickerModule} from 'angular2-color-picker';
 @NgModule({
 imports: [
        ColorPickerModule
    ],
    })
4. 在component底下:
import {ColorPickerService} from 'angular2-color-picker';
 private color: string = "#127bdc";
 constructor(private cpService:){}
5. html底下:
   <input 
                style="height: 30px;
                text-align: center;
                color: white;
                border: 1px solid white;"
                [(colorPicker)]="color" 
                [style.background]="color" 
                [value]="color"
                [cpOutputFormat]="'rgba'"
                [cpToggle]="true" 
                [cpDialogDisplay]="'inline'" 
                (colorPickerChange)="testClr($event)"    
                />
6. system.config.js：
var map = {
        ...    
        'angular2-color-picker': 'node_modules/angular2-color-picker'
    };
var packages = {
        ...
        'angular2-color-picker': {main:'index.js', defaultExtension: 'js'}
    };


topbarfunc
    1: Dashboard
    2: Spectrum
    3: Macro
    4: Performance
    5: ActionSync

ActionSync
    0:Static 
    1:Wave 
    2:Conicband 
    3:Spiral 
    4:Color Cycle 
    5:Linearwave 
    6:Ripple 
    7:Breath 
    8:Rain 
    9:Fire 
    10:Reactive 
    11:Audio









