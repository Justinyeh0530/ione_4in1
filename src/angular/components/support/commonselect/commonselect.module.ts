import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';

// import { SharedModule } from '../shared/shared.module';
import { CommonselectselectComponent } from './commonselect.component';

@NgModule({
    // imports: [CommonModule, SharedModule, FormsModule],
    imports: [CommonModule, FormsModule],
    declarations: [CommonselectselectComponent],
    exports: [CommonselectselectComponent],
})
export class CommonselectselectModule {
    // public static forRoot(): ModuleWithProviders {
    //     return {
    //         ngModule: QselectModule,
    //         providers: [],
    //     };
    // }
}
