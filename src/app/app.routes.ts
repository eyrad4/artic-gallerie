import type { Routes } from '@angular/router';
import { Layout } from './shared/layout/layout';

export const routes: Routes = [
    {
        path: '',
        component: Layout,
        children: [],
    },
];
