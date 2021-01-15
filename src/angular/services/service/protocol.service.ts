declare var System;
import {Injectable,EventEmitter} from '@angular/core';  
import {AppProtocol} from '../protocol/AppProtocol';

@Injectable() 
export class protocolService {

    AppPro:any;
    constructor(){
        this.AppPro = new AppProtocol();
    }

    public RunSetFunction(obj:any){
      var _this  = this;
      return new Promise(function (resolve, reject) {           
         return _this.AppPro.RunSetFunction(obj,(err,data)=>{
            resolve(err);
         });
      }); 
   }

   public RunGetFunction(obj:any){
      var _this  = this;
      return new Promise(function (resolve, reject) { 
         return _this.AppPro.RunGetFunction(obj,(data)=>{
            resolve(data);
         });
      });    
   }

   public GA(Param1:any,Param2:any){
      var _this  = this;
      return new Promise(function (resolve, reject) { 
         var Data = {
            Type : 0x01,
            SN:"",
            Func:"",
            Param:{}
         };
         var obj={
            Func: Param1,
            Param:Param2
         }
         Data.Func = "GA";
         Data.Param = obj;
         console.log(Data)
         return _this.AppPro.RunSetFunction(Data,(data)=>{
            resolve(data);
         });
      });  
   }
}