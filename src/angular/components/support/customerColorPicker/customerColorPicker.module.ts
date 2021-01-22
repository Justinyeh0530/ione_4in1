import { NgModule } from '@angular/core';
import { CustomerColorPickerComponent } from './customerColorPicker.component';
import { CustomerColorPickerRoutes } from './customerColorPicker.routes'; 
import { RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  // imports: [CommonModule, SharedModule, FormsModule],
  imports: [CommonModule, FormsModule],
  declarations: [CustomerColorPickerComponent],
  exports: [CustomerColorPickerComponent],
})
export class CustomerColorPickerModule {
  // public static forRoot(): ModuleWithProviders {
  //     return {
  //         ngModule: QselectModule,
  //         providers: [],
  //     };
  // }
}
