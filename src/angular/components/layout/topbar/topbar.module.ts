import { NgModule } from '@angular/core';
import { TopbarComponent } from './topbar.component';
import { TopbarRoutes } from './topbar.routes'; 
import { RouterModule } from "@angular/router";
import { TranslateModule, TranslatePipe } from 'ng2-translate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@NgModule({
    declarations: [
      TopbarComponent
    ],
    imports: [ 
      CommonModule,
      FormsModule,
      RouterModule.forChild(TopbarRoutes),
      TranslateModule,
    ],
    exports: [
      TranslatePipe,     
    ]
})
export class TopbarpageModule {}