import type { Routes } from '@angular/router';
import { GallerieList } from './features/gallerie-list/gallerie-list';
import { FavoritesButton } from './shared/features/favorites-button/favorites-button';
import { SearchBar } from './shared/features/search-bar/search-bar';
import { Layout } from './shared/layout/layout';

const numericIdGuard = (route: import('@angular/router').ActivatedRouteSnapshot) => /^\d+$/.test(route?.params?.['id']);

export const routes: Routes = [
    {
        path: '',
        component: Layout,
        children: [
            { path: '', component: SearchBar, outlet: 'headerSearch' },
            { path: '', component: FavoritesButton, outlet: 'headerActions' },
            { path: '', component: GallerieList },
            {
                path: 'favorites',
                loadComponent: () => import('./features/favorite-list/favorite-list').then((c) => c.FavoriteList),
            },
            {
                path: ':id',
                canActivate: [numericIdGuard],
                loadComponent: () => import('./features/gallerie-details/gallerie-details').then((c) => c.GallerieDetails),
            },
            {
                path: '**',
                loadComponent: () => import('./shared/ui/not-found').then((c) => c.NotFound),
            },
        ],
    },
];
