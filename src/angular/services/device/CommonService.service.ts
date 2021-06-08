import { Injectable, ApplicationRef } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http'
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
declare var System;
let remote = System._nodeRequire('electron').remote;
let { dialog } = remote;
let win = remote.getGlobal('MainWindow').win;
let env = System._nodeRequire('./backend/others/env');

import { DelayDialogComponent } from '../../components/dialog/delayDialog/delayDialog.component'
import { CheckDialogComponent } from '../../components/dialog/checkDialog/checkDialog.component'
import { SettingDialogComponent } from '../../components/dialog/settingDialog/settingDialog.component'
import { MdDialog, MdDialogConfig, MdDialogRef, TOUCHEND_HIDE_DELAY } from '@angular/material';
import {TranslateService} from 'ng2-translate';

@Injectable()
export class CommonService{

	dialogCheck: MdDialogRef<any>;
	titlepageFlag:any = 0
	currentpage:number = 0;
	WindowSizeFlag: boolean = false;
	// StepArray = {index:-1, DataArray:[]}
	StepArray:any = [];
	StepArrayIndex:number = -1;
	static instance=undefined;
	constructor(
		private http: Http,
		private translate: TranslateService, 
		private dialog: MdDialog, 
		private cdr:ApplicationRef
	) { 
		CommonService.instance=this;
	}

	getIpAddress() {
		return this.http.get('https://api.ipify.org/?format=json')
		.timeout(2000)
		.map((res: Response) => {
			let resJson = res.json();                 
			return resJson;
		});      
	} 

    rgbToHex(r, g, b) {
        r = Number(r);
        g = Number(g);
        b = Number(b);
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
          return r + r + g + g + b + b;
        });
      
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
	}
	
	/**
	 * Select Application EXE
	 */
    SelectAppExe() {
		return new Promise((resolve, reject) => {
			let options = null;
			if (env.isWindows) {
				options = { filters: [{ name: "Custom File Type", extensions: ['exe'] }], properties: ['openFile'] }
			} else {
				options = { defaultPath: "/Applications", filters: [{ name: "Custom File Type", extensions: ["app"] }] };
			}
			dialog.showOpenDialog(win, options, (fns) => {
				let appPath = fns[0];
				resolve(appPath)
			});
		});
    }

	/**
	 * import Data
	 */
    importData() {
		return new Promise((resolve, reject) => {
			let options = null;
			if (env.isWindows) {
				options = { filters: [{ name: "Custom File Type", extensions: ['json'] }], properties: ['openFile'] }
			} else {
				options = { defaultPath: "/Applications", filters: [{ name: "Custom File Type", extensions: ["json"] }] };
			}
			dialog.showOpenDialog(win, options, (fns) => {
				console.log(fns);
				if(fns!=undefined){
					let appPath = fns[0];
					resolve(appPath)
				} else {
					resolve(undefined)
				}
			});
		});
    }

	/**
	 * Export Data
	 */
    exportData(profileName) {
		return new Promise((resolve, reject) => {
			let options = {defaultPath: profileName,filters: [{ name: 'Custom File Type', extensions: ['json'] }] };
			dialog.showSaveDialog(null, options, (fns) => {
				let appPath = fns;
				// console.log(appPath);
				resolve(appPath);
			});
		});
	}
	
	/**
	 * 計算元件座標
	 */
	 getPositionFromElement(element) {
		var top = 0, left = 0;
		do {
			top += element.offsetTop  || 0;
			left += element.offsetLeft || 0;
			element = element.offsetParent;
		} while(element);

		return {
			left: left,
			top: top,
		}
	 }

	/**
	 * delay dialog
	 * @param ElementId 
	 * @param titlename
	 */
	delayDialog(ElementId,second) {
		let contentstyle = document.getElementById(ElementId);
		contentstyle.style.pointerEvents='none';
		contentstyle.style.filter='blur(5px)';
		var winWidth = document.body.clientWidth;
		var winHeight = document.body.clientHeight;
		if(ElementId == 'AppSettingData') {
			winWidth = (winWidth-300)/2-24;
			winHeight = (winHeight-200)/2-100;
		} else {
			winWidth = (winWidth-300)/2 - 24;
			winHeight = (winHeight-200)/2 - 24;
		}
		var title="";
		this.translate.get("Pleasewait").subscribe((res: string) => {
			title = res;
		});
		this.dialogCheck = this.dialog.open(DelayDialogComponent, {position:{top:winHeight.toString()+'px',left:winWidth.toString()+'px'},data:{title:title,second:second}});
		this.cdr.tick();
		this.dialogCheck.afterClosed().subscribe(result => {
			this.dialogCheck = null; 
			contentstyle.style.pointerEvents='auto';
			contentstyle.style.filter='none';
		});
	}

	settingDialog(ElementId) {
		let contentstyle = document.getElementById(ElementId);
		contentstyle.style.pointerEvents='none';
		contentstyle.style.filter='blur(5px)';
		var winWidth = document.body.clientWidth;
		var winHeight = document.body.clientHeight;
		if(ElementId == 'AppSettingData') {
			winWidth = (winWidth-750)/2-24;
			winHeight = (winHeight-650)/2-100;
		} else {
			winWidth = (winWidth-750)/2 - 24;
			winHeight = (winHeight-650)/2 - 24;
		}
		var title="";
		this.translate.get("Pleasewait").subscribe((res: string) => {
			title = res;
		});
		this.dialogCheck = this.dialog.open(SettingDialogComponent, {position:{top:winHeight.toString()+'px',left:winWidth.toString()+'px'}});
		this.cdr.tick();
		this.dialogCheck.afterClosed().subscribe(result => {
			this.dialogCheck = null; 
			contentstyle.style.pointerEvents='auto';
			contentstyle.style.filter='none';
		});
	}

	/**
	 * check dialog
	 * @param ElementId 
	 * @param titlename 
	 */
	checkDialog(ElementId, titlename) {
		let contentstyle = document.getElementById(ElementId);
		contentstyle.style.pointerEvents='none';
		contentstyle.style.filter='blur(5px)';
		var winWidth = document.body.clientWidth;
		var winHeight = document.body.clientHeight;
		winWidth = (winWidth-300)/2 - 24;
		winHeight = (winHeight-200)/2 - 24;
		var title="";
		this.translate.get(titlename).subscribe((res: string) => {
			title = res;
		});
		this.dialogCheck = this.dialog.open(CheckDialogComponent, {position:{top:winHeight.toString()+'px',left:winWidth.toString()+'px'},data:{title:title}});
		this.cdr.tick();
		this.dialogCheck.afterClosed().subscribe(result => {
			this.dialogCheck = null; 
			contentstyle.style.pointerEvents='auto';
			contentstyle.style.filter='none';
			return;
		});
	}

	/**
	 * close Dialog
	 */
	CloseDialog() {
		if(this.dialogCheck != null)
			this.dialogCheck.close();
	}

	/**
	 * 排列Array順序
	 * @param array 
	 * @param key 
	 */
    ArraySort(array, key) {
        return array.sort(function(a, b) {
            var x = a[key];
            var y = b[key];
            return x - y;
        });
	}
	
	setCurrentPage(flag) {
		this.currentpage = flag;
	}

	getCurrentPage() {
		return this.currentpage;
	}

	/**
	 * windows menu
	 * @param flag 0:max 1:min 2:close
	 */
	menu(flag) {
		var window = remote.BrowserWindow.getFocusedWindow();
		if(flag == 0 && this.WindowSizeFlag) {
			window.unmaximize();
            this.WindowSizeFlag = false;
		} else if(flag == 0 && !this.WindowSizeFlag) {
			window.maximize();
            this.WindowSizeFlag = true
		} else if(flag == 2)
        	window.hide();
		else if(flag == 1) 
			window.minimize();
	}

    getObjectDetail(object) {
        let array = []
        for (const [key, value] of Object.entries(object)) {
            // console.log(`${key}: ${value}`);
            let obj = {
                key: key,
                value: value
            }
            array.push(obj);
        }
        return array;
    } 
}