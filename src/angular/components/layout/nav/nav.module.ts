import { NgModule } from '@angular/core';
import { NavComponent } from './nav.component';
import { NavRoutes } from './nav.routes'; 
import { RouterModule } from "@angular/router";
import { TranslateModule, TranslatePipe } from 'ng2-translate';
import { CommonModule } from '@angular/common';
import { CommonselectselectModule } from '../../support/commonselect/commonselect.module'
import { FormsModule } from '@angular/forms';
@NgModule({
    declarations: [
      NavComponent
    ],
    imports: [ 
      CommonselectselectModule,
      CommonModule,
      FormsModule,
      RouterModule.forChild(NavRoutes),
      TranslateModule,
    ],
    exports: [
      TranslatePipe,     
    ]
})
export class NavpageModule {}