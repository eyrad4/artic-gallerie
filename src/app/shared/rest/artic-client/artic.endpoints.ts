import { InjectionToken } from '@angular/core';
import type { EndpointProvider } from '../../../core/rest/rest-query-client';
import { ArticArtworkResponse } from './artic-details';
import { ArticArtworksParams, ArticArtworksResponse } from './artic-list';
import { ArticArtworksSearchParams, ArticArtworksSearchResponse } from './artic-search';

export type ArticEndpointMap = {
    artworks: { response: ArticArtworksResponse; params: ArticArtworksParams };
    'artworks/search': { response: ArticArtworksSearchResponse; params: ArticArtworksSearchParams };
    'artworks/:id': { response: ArticArtworkResponse; params: { id: number; fields?: string[] } };
};

export const ARTIC_BASE_URL = new InjectionToken<string>('ARTIC_BASE_URL', {
    providedIn: 'root',
    factory: () => 'https://api.artic.edu/api/v1',
});

export const ARTIC_ENDPOINTS = new InjectionToken<EndpointProvider<ArticEndpointMap>>('ARTIC_ENDPOINTS', {
    providedIn: 'root',
    factory: () => ({
        artworks: () => '/artworks',
        'artworks/search': () => '/artworks/search',
        'artworks/:id': ({ id }) => `/artworks/${id}`,
    }),
});
