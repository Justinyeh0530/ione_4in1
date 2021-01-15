declare var System;
import { Component ,OnInit ,Output,Input ,EventEmitter, SimpleChange, OnChanges,ViewChild,ElementRef, ChangeDetectorRef} from '@angular/core';
let remote = System._nodeRequire('electron').remote;

@Component({
    selector: 'app-ColorPicker',
    templateUrl : './components/support/customerColorPicker/customerColorPicker.component.html',
    styleUrls: ['./components/support/customerColorPicker/customerColorPicker.component.css']
})

export class CustomerColorPickerComponent implements OnInit{
    @Output()
    ColorChange = new EventEmitter<object>();
    // @Input()
    // CurrentDevice:any;
    // @Input()
    // CurrentProfile:any;
    HeadsetCanvasMouseMoveEvent: any;
    HeadsetCanvasMouseupEvent: any;
    HeadsetCanvasMouseDownEvent: any;
    ColorPointFlag:boolean = false;
    context:any;
    ColorPoint:any;
    ColorPointStartX:any;
    ColorPointStartY:any;
    StartColorLightPointX:number = 0;
    StartColorLightPointY:number = 0;
    ColorLightPointAngle:number = 0;
    ColorLightPoint:any;
    ColorLightPointFlag:boolean = false;
    rotate:number = 0;
    Color:any = {
        R: 0,
        G: 0,
        B: 0,
        A: 0
    }

    constructor(
        ){
            console.log('CustomerColorPickerComponent loading complete');
        }

    ngOnInit(){
        this.ColorLightPoint = document.getElementById('Color-Lighting-Point') as HTMLCanvasElement;
        this.ColorPoint = document.getElementById("ColorPoint") as HTMLCanvasElement;
        let canvas = document.getElementById("HeadsetCanvas") as HTMLCanvasElement;
        this.context = canvas.getContext('2d');
        let myImg = document.getElementById("HeadsetImg") as HTMLCanvasElement;
        let img = new Image();
        img.addEventListener('load', event =>{
            this.context.drawImage(myImg, 0, 0);
        });
        img.src = myImg.src;
        this.HeadsetCanvasMouseMoveEvent = this.HeadsetCanvasMouseMove.bind(this)
        this.HeadsetCanvasMouseupEvent = this.HeadsetCanvasMouseup.bind(this)
        this.HeadsetCanvasMouseDownEvent = this.HeadsetCanvasMouseDown.bind(this)
        document.getElementById('HeadsetCanvas').addEventListener('mousedown',this.HeadsetCanvasMouseDownEvent)
        document.getElementById('HeadsetCanvas').addEventListener('mousemove',this.HeadsetCanvasMouseMoveEvent)
        document.getElementById('HeadsetCanvas').addEventListener('mouseup',this.HeadsetCanvasMouseupEvent)

        this.initData();
    }

    initData() {
        this.ColorLightPointAngle = 0;
        this.ColorLightPoint.style.transform = `rotate(${this.ColorLightPointAngle}deg)`
    }

    HeadsetCanvasMouseDown(event) {
        console.log('mouse down',event)
        if(event.target.id == 'HeadsetCanvas') {
            this.ColorPointFlag = true;
            this.ColorPointStartX = event.clientX;
            this.ColorPointStartY = event.clientY;
        } else
            this.ColorPointFlag = false;
    }

    HeadsetCanvasMouseMove(event) {
        let pixelData, Colordata;
        if(this.ColorPointFlag) {
            pixelData = this.context.getImageData(event.offsetX, event.offsetY, 1, 1)
            Colordata = pixelData.data;
            if(Colordata[0] != 0 && Colordata[1] != 0 && Colordata[2] != 0) {
                this.ColorPoint.style.left = event.offsetX + 16 + 'px';
                this.ColorPoint.style.top = event.offsetY + 16 + 'px';
                this.ColorPoint.style.backgroundColor = `rgb(${Colordata[0]},${Colordata[1]},${Colordata[2]})`
                // console.log('R:'+Colordata[0],'G:'+Colordata[1],'B:'+Colordata[2],event)
                this.Color.R = Colordata[0];
                this.Color.G = Colordata[1];
                this.Color.B = Colordata[2];
                this.ColorChange.emit(this.Color);
            }
        }
    }

    HeadsetCanvasMouseup(event) {
        if(this.ColorPointFlag)
            this.ColorPointFlag = false;
    }

    ColorLightPointDown(event) {
        console.log('down',event)
        if(event.target.id == 'Color-Lighting-Point') {
            this.ColorLightPointFlag = true;
            this.StartColorLightPointX = event.clientX;
            this.StartColorLightPointY = event.clientY;
        } else {
            this.ColorLightPointFlag = false;
        }
    }

    ColorLightPointMove(event) {
        let Angle, ResultAngle;
        if(this.ColorLightPointFlag) {
            Angle = this.getTwoPointAngle(this.StartColorLightPointX, this.StartColorLightPointY, event.clientX, event.clientY);
            if(event.clientX - this.StartColorLightPointX > 0) {
                ResultAngle = this.ColorLightPointAngle + Angle;
                this.rotate = ResultAngle > 360 ? ResultAngle - 360 : ResultAngle;
            } else {
                Angle = 360 - Angle;
                ResultAngle = this.ColorLightPointAngle - Angle;
                this.rotate = ResultAngle < 0 ? ResultAngle + 360 : ResultAngle;
            }
            this.ColorLightPoint.style.transform = `rotate(${this.rotate}deg)`;
            this.Color.A = 100 - (this.rotate * 100 / 360);
            this.ColorChange.emit(this.Color);
        }
    }

    ColorLightPointUp(event) {
        if(this.ColorLightPointFlag) {
            this.ColorLightPointFlag = false;
            this.ColorLightPointAngle = this.rotate;
        }
    }

    getTwoPointAngle(px1: number, py1: number, px2: number, py2: number) {
        let rect = document.getElementsByClassName('Color-Lighting-Point')[0].getBoundingClientRect();
        let {
            x,
            y,
            width,
            height
        } = rect;

        //中心點
        let cx = x + width / 2;
        let cy = y + height / 2;

        //2個點之間的角度獲取
        let c1 = Math.atan2(py1 - cy, px1 - cx) * 180 / (Math.PI);
        let c2 = Math.atan2(py2 - cy, px2 - cx) * 180 / (Math.PI);
        let angle;
        c1 = c1 <= -90 ? (360 + c1) : c1;
        c2 = c2 <= -90 ? (360 + c2) : c2;

        //夾角獲取
        angle = Math.floor(c2 - c1);
        angle = angle < 0 ? angle + 360 : angle;
        return angle;
    }

    ngOnChanges() {
        
    }

    /**
     * Re-intit UI for data change
     * @flag 1: Reinit 2:Reset to Default
     */
    Reinit(flag) {
    
    }

    ngAfterViewInit() {
    }

    ngOnDestroy(){
    }
}