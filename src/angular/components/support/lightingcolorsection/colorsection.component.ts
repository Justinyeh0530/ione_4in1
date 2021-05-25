declare var System;
import { Component ,OnInit ,Output,Input ,EventEmitter, SimpleChange, OnChanges,ViewChild,ElementRef, ChangeDetectorRef} from '@angular/core';
import { CommonService, HeadsetFunctionService } from '../../../services/device/index'
let remote = System._nodeRequire('electron').remote;

@Component({
    selector: 'app-ColorSection',
    templateUrl : './components/support/lightingcolorsection/colorsection.component.html',
    styleUrls: ['./components/support/lightingcolorsection/colorsection.component.css']
})

export class ColorSectionComponent implements OnInit{
    @Output()
    ColorSectionChange = new EventEmitter<object>();

    @Input()
    ColorSectionArray:any;
    @Input()
    id:any;

    subscription:any;
    subscription2:any;
    dotindex:number = -1;
    cloneDot:any;
    dotflag:boolean = false;
    StartPosX:number = 0;

    constructor(
        private commonService: CommonService,
        private headsetFunctionService: HeadsetFunctionService

    ){
        this.dotindex = this.headsetFunctionService.dotindex;
        console.log('ColorSectionComponent loading complete');
        this.subscription = this.headsetFunctionService.updateColorSection.subscribe((data) => {
            this.ColorSectionArray = data;
            this.initData();
        })
        this.subscription2 = this.headsetFunctionService.removeColorSection.subscribe((data) => {
            let parent = document.getElementById(`ColorSection-${this.id}`);
            var Card = document.getElementById(`color-dot-${this.id}` + data);
            this.dotindex = -1;
            parent.removeChild(Card);
            this.repaint();
        });
        this.subscription2 = this.headsetFunctionService.addColorSection.subscribe((data) => {
            let left = 0;
            let color;
            if(this.dotindex != -1) {
                let index = this.ColorSectionArray.findIndex(x => x.value == this.dotindex);
                if(index != -1) {
                    left = this.ColorSectionArray[index].left;
                    color = this.ColorSectionArray[index].color;
                }
            } else {
                left = this.ColorSectionArray[0].left;
                color = this.ColorSectionArray[0].color
            }
            let obj = {
                value: data + 1,
                left: left,
                color: color
            }
            this.ColorSectionArray.push(obj);
            console.log(headsetFunctionService.ColorSectionArray)
            this.CreateElement(data + 1, left + 10);
            this.commonService.ArraySort(this.ColorSectionArray, 'left')
            this.repaint();
            this.dotindex = data + 1;
            for(let i = 0; i < this.ColorSectionArray.length; i++) {
                document.getElementById(`color-item-up-${this.id}` + this.ColorSectionArray[i].value).style.display = 'none';
                document.getElementById(`color-item-down-${this.id}` + this.ColorSectionArray[i].value).style.display = 'none';
            }
            document.getElementById(`color-item-up-${this.id}` + (data + 1)).style.display = 'block';
            document.getElementById(`color-item-down-${this.id}` + (data + 1)).style.display = 'block';
        });
    }

    ngOnInit(){
        setTimeout(() => {
            let card = document.getElementById('color-dot-' + this.id);
            this.cloneDot = card.cloneNode(true);
            document.getElementById('color-dot-' + this.id).style.display = "none";
            this.initData();
        });
    }

    initData() {
        var x = document.getElementById(`ColorSection-${this.id}`);
        while (x.firstChild)
            x.removeChild(x.firstChild);
        for(let i = 0; i < this.ColorSectionArray.length; i++) 
            this.CreateElement(this.ColorSectionArray[i].value, this.ColorSectionArray[i].left);
        if(this.dotindex != -1) {
            for(let i = 0; i < this.ColorSectionArray.length; i++) {
                document.getElementById(`color-item-up-${this.id}` + this.ColorSectionArray[i].value).style.display = 'none';
                document.getElementById(`color-item-down-${this.id}` + this.ColorSectionArray[i].value).style.display = 'none';
            }
            // document.getElementById(`color-item-up-${this.id}` + this.dotindex).style.display = 'block';
            // document.getElementById(`color-item-down-${this.id}` + this.dotindex).style.display = 'block';
        }
        this.repaint();
    }

    repaint() {
        let string = "";
        for(let i = 0; i < this.ColorSectionArray.length; i++) {
            let percentage = (this.ColorSectionArray[i].left + 10) * 100 / 400;
            string = string + `,rgb(${this.ColorSectionArray[i].color[0]},${this.ColorSectionArray[i].color[1]},${this.ColorSectionArray[i].color[2]}, ${this.ColorSectionArray[i].color[3]}) ${percentage}%`
        }
        // console.log(222222,"linear-gradient(to right" + string + ")",this.ColorSectionArray)
        document.getElementById(`ColorSection-${this.id}`).style.background = "linear-gradient(to right" + string + ")"
    }

    CreateElement(index, left) {
        let parent = document.getElementById(`ColorSection-${this.id}`);
        let card = this.cloneDot.cloneNode(true);
        card.setAttribute("id", `color-dot-${this.id}` + index);
        card.querySelector(`#color-item-up-${this.id}`).setAttribute("id", `color-item-up-${this.id}` + index);
        card.querySelector(`#color-item-down-${this.id}`).setAttribute("id", `color-item-down-${this.id}` + index);
        card.querySelector(`#color-item-main-${this.id}`).addEventListener('mousedown', this.DotMouseDown.bind(this));
        card.querySelector(`#color-item-main-${this.id}`).addEventListener('mouseup', this.DotMouseUp.bind(this));
        card.querySelector(`#color-item-main-${this.id}`).setAttribute("id", `color-item-main-${this.id}` + index);
        parent.appendChild(card);
        document.getElementById(`color-item-up-${this.id}` + index).style.display = 'none';
        document.getElementById(`color-item-down-${this.id}` + index).style.display = 'none';
        document.getElementById(`color-dot-${this.id}` + index).style.left = left + 'px';
    }

    DotMouseDown(event) {
        // console.log('DotMouseDown',event)
        var dotid = $(event.target).attr('id')
        var number = dotid.replace(/[^0-9]/ig,"");
        this.dotindex = Number(number);
        this.dotflag = true;
        for(let i = 0; i < this.ColorSectionArray.length; i++) {
            document.getElementById(`color-item-up-${this.id}` + this.ColorSectionArray[i].value).style.display = 'none';
            document.getElementById(`color-item-down-${this.id}` + this.ColorSectionArray[i].value).style.display = 'none';
        }
        document.getElementById(`color-item-up-${this.id}` + number).style.display = 'block';
        document.getElementById(`color-item-down-${this.id}` + number).style.display = 'block';
        // this.StartPosX = event.offsetX;
        document.getElementById('ColorSection-' + this.id).addEventListener('mousemove',this.ColorSectionMouseMove.bind(this))
        document.getElementById('fake-item-' + this.id).addEventListener('mouseup',this.FakeColorSectionMouseUp.bind(this))
    }

    ColorSectionMouseMove(event) {
        // console.log('ColorSectionMouseMove',event)
        let x = 0;
        if(this.dotflag && event.target.id == 'ColorSection-' + this.id) {
            let index = this.ColorSectionArray.findIndex(x => x.value == this.dotindex)
            if(index != -1) {
                if(event.offsetX > 384)
                    x= 384;
                else
                    x = event.offsetX;
                document.getElementById(`color-dot-${this.id}` + this.dotindex).style.left = x + 'px';
                this.ColorSectionArray[index].left = event.offsetX;
                this.commonService.ArraySort(this.ColorSectionArray, 'left')
                // this.ColorSectionChange.emit({Array:this.ColorSectionArray, dotindex:this.dotindex})
                this.repaint();
            }
        }
    }

    FakeColorSectionMouseUp(event) {
        // console.log('FakeColorSectionMouseUp',event)
        this.dotflag = false;
        document.getElementById('ColorSection-' + this.id).removeEventListener('mousemove',this.ColorSectionMouseMove.bind(this))
        document.getElementById('fake-item-' + this.id).removeEventListener('mouseup',this.ColorSectionMouseMove.bind(this))
        this.ColorSectionChange.emit({Array:this.ColorSectionArray, dotindex:this.dotindex})
    }

    DotMouseUp(event) {
        // console.log('DotMouseUp',event)
        this.dotflag = false;
        document.getElementById('ColorSection-' + this.id).removeEventListener('mousemove',this.ColorSectionMouseMove.bind(this))
        document.getElementById('fake-item-' + this.id).removeEventListener('mouseup',this.ColorSectionMouseMove.bind(this))
        this.ColorSectionChange.emit({Array:this.ColorSectionArray, dotindex:this.dotindex})
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
        this.subscription.unsubscribe();
        this.subscription2.unsubscribe();
    }
}