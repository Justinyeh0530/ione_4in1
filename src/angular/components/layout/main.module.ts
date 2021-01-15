import { NgModule } from '@angular/core';
import { MainComponent } from './main.component';
import { MainRoutes } from './main.routes'; 
import { RouterModule } from "@angular/router";
import { TranslateModule, TranslatePipe } from 'ng2-translate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@NgModule({
    declarations: [
      MainComponent
    ],
    imports: [ 
      CommonModule,
      FormsModule,
      RouterModule.forChild(MainRoutes),
      TranslateModule,
    ],
    // providers:[
    //   TranslateModule
    // ],
    exports: [
      TranslatePipe,     
    ]
})
export class MainpageModule {}