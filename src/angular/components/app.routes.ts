import { Routes } from '@angular/router';

export const routes: Routes = [ 
    { path: 'content', loadChildren: './components/layout/content/content.module#ContentModule' },
    { path: 'actionsync', loadChildren: './components/layout/actionsync/actionsync.module#ActionSyncModule' },
];