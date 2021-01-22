import { NgModule } from '@angular/core';
import { ActionSyncComponent } from './actionsync.component';
import { ActionSyncRoutes } from './actionsync.routes'; 
import { RouterModule } from "@angular/router";
import { TranslateModule, TranslatePipe } from 'ng2-translate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonselectselectModule } from '../../support/commonselect/commonselect.module'
import { CustomerColorPickerModule } from '../../support/customerColorPicker/customerColorPicker.module'
import { ColorSectionModule } from '../../support/colorsection/colorsection.module'
@NgModule({
    declarations: [
      ActionSyncComponent,
    ],
    imports: [ 
      CommonselectselectModule,
      ColorSectionModule,
      CommonModule,
      FormsModule,
      RouterModule.forChild(ActionSyncRoutes),
      TranslateModule,
      CustomerColorPickerModule
    ],
    exports: [
      TranslatePipe,     
    ]
})
export class ActionSyncModule {}