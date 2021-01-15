import { NgModule } from '@angular/core';
import { ActionSyncComponent } from './actionsync.component';
import { ActionSyncRoutes } from './actionsync.routes'; 
import { RouterModule } from "@angular/router";
import { TranslateModule, TranslatePipe } from 'ng2-translate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonselectselectModule } from '../../support/commonselect/commonselect.module'
@NgModule({
    declarations: [
      ActionSyncComponent
    ],
    imports: [ 
      CommonselectselectModule,
      CommonModule,
      FormsModule,
      RouterModule.forChild(ActionSyncRoutes),
      TranslateModule,
    ],
    exports: [
      TranslatePipe,     
    ]
})
export class ActionSyncModule {}