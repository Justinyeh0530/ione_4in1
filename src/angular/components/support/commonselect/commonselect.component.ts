declare var System;
import { Component ,OnInit ,Output,Input ,EventEmitter, SimpleChange, OnChanges, ViewEncapsulation, forwardRef} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {TranslateService, LangChangeEvent} from 'ng2-translate';
import { ComponentStillLoadingError } from '@angular/compiler/src/private_import_core';
let remote = System._nodeRequire('electron').remote;

@Component({
    selector: 'app-commonselect',
    templateUrl : './components/support/commonselect/commonselect.component.html',
    styleUrls: ['./components/support/commonselect/commonselect.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CommonselectselectComponent),
            multi: true,
        },
    ],
    encapsulation: ViewEncapsulation.None
})

export class CommonselectselectComponent implements OnInit,ControlValueAccessor{
    @Input()
    inputoption:any;
    @Input()
    componentId:any;

    tampinput:any;
    refreshflag:any=0;
    a:any;
    b:any;
    c:any;

    public selectdata:any;

    AppsettingData:any;
    closeAllSelectEvent:any;
    translatesubscribe:any;
    private onChangeCallback: (_: any) => void;
    private onTouchedCallback: () => void;

    constructor(private translate: TranslateService){
        this.onTouchedCallback = () => {};
        this.onChangeCallback = () => {};
    }

    ngOnInit(){
        try {
            this.closeAllSelectEvent = this.closeAllSelect.bind(this);
            setTimeout(()=>{
                this.tampinput = this.inputoption;
                this.initselect();
                this.refreshflag = 1;
                var self = this;
                this.translatesubscribe = this.translate.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
                    for(var i=0; i<this.inputoption.length; i++){
                        if(this.inputoption[i].hasOwnProperty('translate'))
                            this.translate.get(this.inputoption[i].translate).subscribe((data: string) => { 
                                this.inputoption[i].name = data; 
                                if(i==this.inputoption.length-1)
                                    self.Reinit();
                            }); 
                    }
                });
            })
        } catch(e) {
            console.error(e)
        }
    }

    ngOnChanges(){
        setTimeout(()=>{
            this.Reinit();
        })
    }

    ngOnDestroy() {
        document.removeEventListener("click", this.closeAllSelectEvent);
        this.translatesubscribe.unsubscribe();
    }

    Reinit(){
        // if(this.tampinput!=this.inputoption && this.refreshflag!=0){
        try{
            if(this.refreshflag!=0){
                this.refreshflag = 0;
                this.tampinput = this.inputoption;
                var x = document.getElementsByClassName("custom-commonselect" + this.componentId);
                this.b.removeChild(this.c);
                for (var i = 0; i < x.length; i++) {
                    var length =x[i].getElementsByTagName("select")[0].length;
                    for(var j=0; j<length; j++)
                        x[i].getElementsByTagName("select")[0].remove( x[i].getElementsByTagName("select")[0].selectedIndex);
                    x[i].removeChild(this.a);
                    x[i].removeChild(this.b);
                }
                document.removeEventListener("click", this.closeAllSelectEvent);
                this.initselect();
            }
        }catch(e){
            console.error('commonselectComponent',e)
            this.Reinit();
        }
    }

    initselect(){        
        var x, i, j, selElmnt;
        /* Look for any elements with the class "custom-select": */
        x = document.getElementsByClassName("custom-commonselect" + this.componentId);
        for (i = 0; i < x.length; i++) {
            selElmnt = x[i].getElementsByTagName("select")[0];
            for (j = 0; j < this.inputoption.length; j++) {
                var newOption = document.createElement("option");
                newOption.value = this.inputoption[j].value;
                newOption.text = this.inputoption[j].name;
                selElmnt.add(newOption);
            }
            /* For each element, create a new DIV that will act as the selected item: */
            this.a = document.createElement("DIV");
            this.a.setAttribute("class", "commonselect-selected");
            this.a.setAttribute("id","commonselect-selected" + this.componentId);
            this.a.setAttribute('overflow-y','auto');
            if(this.selectdata != undefined && selElmnt.options[this.selectdata] != undefined)
                selElmnt.selectedIndex = this.selectdata;
            this.a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
            x[i].appendChild(this.a);
            /* For each element, create a new DIV that will contain the option list: */
            this.b = document.createElement("DIV");
            this.b.setAttribute("class", "commonselect-items commonselect-hide");
            if(selElmnt.length > 5)
                this.b.style.height = '190px';
            this.b.style.overflow = 'auto';
            this.b.setAttribute("id","commonselect-items" + this.componentId);
            for (j = 0; j < selElmnt.length; j++) {
                /* For each option in the original select element,
                create a new DIV that will act as an option item: */
                this.c = document.createElement("DIV");
                this.c.innerHTML = selElmnt.options[j].innerHTML;
                var self = this;
                this.c.setAttribute("id","common" + this.componentId)
                // document.getElementById("common" + this.componentId).addEventListener("click", function(e) {
                this.c.addEventListener("click", function(e) {
                    /* When an item is clicked, update the original select box,
                    and the selected item: */
                    var y, i, k, s, h;
                    s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                    h = this.parentNode.previousSibling;
                    for (i = 0; i < s.length; i++) {
                        if (s.options[i].innerHTML == this.innerHTML) {
                            self.qSelect(i);
                            s.selectedIndex = i;
                            h.innerHTML = this.innerHTML;
                            y = this.parentNode.getElementsByClassName("same-as-commonselected");
                            for (k = 0; k < y.length; k++) {
                                y[k].removeAttribute("class");
                            }
                            this.setAttribute("class", "same-as-commonselected");
                            break;
                        }
                    }
                    h.click();
                });
                this.b.appendChild(this.c);
            }
            x[i].appendChild(this.b);
            // this.a.addEventListener("click", function(e) {
            //     /* When the select box is clicked, close any other select boxes,
            //     and open/close the current select box: */
            //     e.stopPropagation();
            //     closeAllSelect(this);
            //     this.nextSibling.classList.toggle("commonselect-hide");
            //     this.classList.toggle("commonselect-arrow-active");
            // });
        }

        /* If the user clicks anywhere outside the select box,
        then close all select boxes: */
        document.addEventListener("click", this.closeAllSelectEvent);
        this.refreshflag = 1;
    }

    closeAllSelect(elmnt) {
        /* A function that will close all select boxes in the document,
        except the current select box: */
        var x, y, i, arrNo = [];
        x = document.getElementsByClassName("commonselect-items");
        y = document.getElementsByClassName("commonselect-selected");
        for (i = 0; i < y.length; i++) {
            if (elmnt.target == y[i]) {
                arrNo.push(i)
            } else {
                y[i].classList.remove("commonselect-arrow-active");
            }
        }
        for (let j = 0; j < x.length; j++) {
            if (arrNo.indexOf(j)) {
                x[j].classList.add("commonselect-hide");
            }
        }

        var thisID = "common"
        if(elmnt.target.id.indexOf("select-") >= 0){
            let SelecItemtelement = document.getElementById(thisID + "select-items" + this.componentId);
            let Selectedelement = document.getElementById(thisID + "select-selected" + this.componentId);
            // let MainId = elmnt.target.id.split('select-')[0];
            // if(MainId != thisID && SelecItemtelement && Selectedelement) {
            //     SelecItemtelement.classList.add(thisID+"select-hide");
            //     console.log(33333,SelecItemtelement)
            //     Selectedelement.classList.remove(thisID+"select-arrow-active");
            // }else if(SelecItemtelement && Selectedelement) {
            //     SelecItemtelement.classList.toggle(thisID+"select-hide")
            //     Selectedelement.classList.toggle(thisID+'select-arrow-active')
            //     console.log(444444,SelecItemtelement)
            // }

            // if(SelecItemtelement && Selectedelement) {
            //     SelecItemtelement.classList.toggle(thisID+"select-hide")
            //     Selectedelement.classList.toggle(thisID+'select-arrow-active')
            //     console.log(444444,SelecItemtelement)
            // }

            if(elmnt.target.id != "commonselect-selected" + this.componentId && SelecItemtelement && Selectedelement) {
                SelecItemtelement.classList.add(thisID+"select-hide");
                Selectedelement.classList.remove(thisID+"select-arrow-active");
            }else if(SelecItemtelement && Selectedelement) {
                SelecItemtelement.classList.toggle(thisID+"select-hide")
                Selectedelement.classList.toggle(thisID+'select-arrow-active')
            }
        }
    }

    public qSelect(data):void {
        this.selectdata = data;
        this.onChangeCallback(this.inputoption[data]);
        this.onTouchedCallback();
    }

    public writeValue(obj: any): void {
        // throw new Error("Method not implemented.");
        var sekected;
        var x = document.getElementsByClassName("custom-commonselect" + this.componentId);
        for (var i = 0; i < x.length; i++) {
            sekected = x[i].getElementsByClassName("commonselect-selected")[0]
        }
        if(obj != null && sekected != undefined){
            for(var j = 0; j < this.inputoption.length; j++){
                if(this.inputoption[j] == obj){
                    this.selectdata = j;
                    sekected.innerHTML = this.inputoption[j].name;
                    break;
                }
            }
        }
    }
    public registerOnChange(fn: any): void {
        // throw new Error("Method not implemented.");
        this.onChangeCallback = fn;
    }
    public registerOnTouched(fn: any): void {
        // throw new Error("Method not implemented.");
        this.onTouchedCallback = fn;
    }
}