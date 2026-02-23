import { ArticArtworksParams, ArticArtworksResponse } from './artic-list';

export type ArticArtworksSearchResponse = ArticArtworksResponse;

export interface ArticArtworksSearchParams extends ArticArtworksParams {
    q: string;
}
