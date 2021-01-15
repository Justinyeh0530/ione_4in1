let remote = window['System']._nodeRequire('electron').remote; 
let evtVar = window['System']._nodeRequire('./backend/others/EventVariable');
let funcVar = window['System']._nodeRequire('./backend/others/FunctionVariable');
let env = window['System']._nodeRequire('./backend/others/env');


export class AppProtocol {

    protocol:any;

    constructor(){
       this.protocol = remote.getGlobal('AppProtocol');
    }

     public RunSetFunction(obj:any,callback:any){
        // env.log('AppProtocol','RunSetFunction',JSON.stringify(obj));
        if (obj.Type === funcVar.FuncType.System ){
            this.RunSetFunctionSystem(obj,callback);           
        } else if (obj.Type === funcVar.FuncType.Device){
            this.RunSetFunctionDevice(obj,callback);
        } else if (obj.Type === funcVar.FuncType.Mouse){
            this.RunSetFunctionDevice(obj,callback);
        } else if (obj.Type === funcVar.FuncType.Keyboard){
            this.RunSetFunctionDevice(obj,callback);
        } else if (obj.Type === funcVar.FuncType.Headset){
            this.RunSetFunctionDevice(obj,callback);
        }
    }
   
    public RunGetFunction(obj:any,callback:any){
        if (obj.Type === funcVar.FuncType.System ){
           this.RunGetFunctionSystem(obj,callback);
        } else if (obj.Type === funcVar.FuncType.Device){
            this.RunGetFunctionDevice(obj,callback);
        } else if (obj.Type === funcVar.FuncType.Mouse){
            this.RunSetFunctionDevice(obj,callback);
        } else if (obj.Type === funcVar.FuncType.Keyboard){
            this.RunSetFunctionDevice(obj,callback);
        } else if (obj.Type === funcVar.FuncType.Headset){
            this.RunSetFunctionDevice(obj,callback);
        }
    }  


    private RunGetFunctionSystem(obj:any,callback:any){
    //    if(this.checkGetSystemFunction(obj.Func))
    //    {   
           var Obj1 = { Type:funcVar.FuncType.System, Func:obj.Func, Param : obj.Param } ;
           this.protocol.RunFunction(Obj1,(data)=> { callback(data); });
    //    }else{
    //        callback("functionNameError");
    //    }
    }

    private RunSetFunctionSystem(obj:any,callback:any) {
        // console.log("Robert:"+JSON.stringify(obj));
        // if(this.checkSetSystemFunction(obj.Func)){
            var Obj1 = { Type:funcVar.FuncType.System, Func:obj.Func, Param : obj.Param } ;
            this.protocol.RunFunction(Obj1, (err,data) => { callback(err); });
        // }else{
        //      callback("functionNameError");
        // } 
    }
    
    private RunGetFunctionDevice(obj:any,callback:any){
        // if(this.checkGetDeviceFunction(obj.Func))
        // {   
            var Obj1 = { Type:obj.Type, Func:obj.Func, Param : obj.Param , SN: obj.SN} ;
            this.protocol.RunFunction(Obj1,(data)=> { callback(data); });
        // }else{
        //     callback("functionNameError");
        // }
     }
 
     private RunSetFunctionDevice(obj:any,callback:any) {
        //  console.log("Robert:"+JSON.stringify(obj));
        //  if(this.checkSetDeviceFunction(obj.Func)){
             var Obj1 = { Type:obj.Type, Func:obj.Func, Param : obj.Param , SN: obj.SN} ;
             this.protocol.RunFunction(Obj1, (err,data) => { callback(err); });
        //  }else{
        //       callback("functionNameError");
        //  } 
     } 

}