import { NgModule } from '@angular/core';
import { ContentComponent } from './content.component';
import { ContentRoutes } from './content.routes'; 
import { RouterModule } from "@angular/router";
import { TranslateModule, TranslatePipe } from 'ng2-translate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonselectselectModule } from '../../support/commonselect/commonselect.module'
import { CustomerColorPickerModule } from '../../support/customerColorPicker/customerColorPicker.module'
import { ColorSectionModule } from '../../support/lightingcolorsection/colorsection.module'
@NgModule({
    declarations: [
      ContentComponent,
    ],
    imports: [ 
      CommonselectselectModule,
      ColorSectionModule,
      CommonModule,
      FormsModule,
      RouterModule.forChild(ContentRoutes),
      TranslateModule,
      CustomerColorPickerModule
    ],
    exports: [
      TranslatePipe,     
    ]
})
export class ContentModule {}