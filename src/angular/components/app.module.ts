import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import	{MaterialModule} from '@angular/material';

import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmitService } from '../services/libs/electron/services/emit.service';
import { DeviceService, GetAppService, CommonService, HeadsetFunctionService, FunctionService, ActionSyncService} from '../services/device/index';
import { CheckDialogComponent } from './dialog/checkDialog/checkDialog.component';
import { DelayDialogComponent } from './dialog/delayDialog/delayDialog.component';
import { NavComponent } from './layout/nav/nav.component'
import { MainComponent } from './layout/main.component';
import { TopbarComponent } from './layout/topbar/topbar.component'
import { ContentComponent } from './layout/content/content.component'
// import { CustomerColorPickerComponent } from './support/customerColorPicker/customerColorPicker.component'
import { CommonselectselectModule } from './support/commonselect/commonselect.module'
import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate';

// app routes
import { routes } from './app.routes';
let routerModule = RouterModule.forRoot(routes);

import { HttpModule ,Http} from '@angular/http';
import { from } from 'rxjs/observable/from';
// import { OrderBy } from './orderBy.pipe'

routerModule = RouterModule.forRoot(routes, {useHash: true});
@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        TopbarComponent,
        NavComponent,
        // ContentComponent,
        DelayDialogComponent,
        CheckDialogComponent,
        // CustomerColorPickerComponent
        // OrderBy
    ],
    imports: [
        CommonselectselectModule,
        BrowserModule,
        FormsModule,
        routerModule,
        MaterialModule.forRoot(),
        HttpModule,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            deps: [Http],
            useFactory: (http: Http) => new TranslateStaticLoader(http, 'i18n', '.json')
        }) 
    ],
    entryComponents:[
        DelayDialogComponent,
        CheckDialogComponent
    ],
    bootstrap: [
        AppComponent,
    ],
    providers: [
        FunctionService,
        HeadsetFunctionService,
        ActionSyncService,
        CommonService,
        GetAppService,
        DeviceService,
        EmitService,
        {
            provide: APP_BASE_HREF,
            useValue: '<%= APP_BASE %>'
        }
    ]
                    
})

export class AppModule { }