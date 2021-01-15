import { NgModule } from '@angular/core';
import { CustomerColorPickerComponent } from './customerColorPicker.component';
import { CustomerColorPickerRoutes } from './customerColorPicker.routes'; 
import { RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { SharedModule } from "../../shared.module";
@NgModule({
    declarations: [
      CustomerColorPickerComponent
    ],
    imports: [ 
      CommonModule,
      FormsModule,
      RouterModule.forChild(CustomerColorPickerRoutes),
    ],
    // providers:[
    //   TranslateModule
    // ],
    exports: [
    ]
})
export class CustomerColorPickerModule {}