import { NgModule } from '@angular/core';
import { ColorSectionComponent } from './colorsection.component';
import { ColorSectionRoutes } from './colorsection.routes'; 
import { RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { SharedModule } from "../../shared.module";

@NgModule({
  // imports: [CommonModule, SharedModule, FormsModule],
  imports: [CommonModule, FormsModule],
  declarations: [ColorSectionComponent],
  exports: [ColorSectionComponent],
})
export class ColorSectionModule {
  // public static forRoot(): ModuleWithProviders {
  //     return {
  //         ngModule: QselectModule,
  //         providers: [],
  //     };
  // }
}
