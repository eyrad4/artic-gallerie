import type { Routes } from '@angular/router';
import { GallerieList } from './features/gallerie-list/gallerie-list';
import { FavoritesButton } from './shared/features/favorites-button/favorites-button';
import { SearchBar } from './shared/features/search-bar/search-bar';
import { Layout } from './shared/layout/layout';

export const routes: Routes = [
    {
        path: '',
        component: Layout,
        children: [
            { path: '', component: SearchBar, outlet: 'headerSearch' },
            { path: '', component: FavoritesButton, outlet: 'headerActions' },
            { path: '', component: GallerieList },
        ],
    },
];
