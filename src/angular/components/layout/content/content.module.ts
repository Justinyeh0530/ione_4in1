import { NgModule } from '@angular/core';
import { ContentComponent } from './content.component';
import { ContentRoutes } from './content.routes'; 
import { RouterModule } from "@angular/router";
import { TranslateModule, TranslatePipe } from 'ng2-translate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonselectselectModule } from '../../support/commonselect/commonselect.module'
import { CustomerColorPickerComponent } from '../../support/customerColorPicker/customerColorPicker.component'
@NgModule({
    declarations: [
      ContentComponent,
      CustomerColorPickerComponent
    ],
    imports: [ 
      CommonselectselectModule,
      CommonModule,
      FormsModule,
      RouterModule.forChild(ContentRoutes),
      TranslateModule,
    ],
    exports: [
      TranslatePipe,     
    ]
})
export class ContentModule {}