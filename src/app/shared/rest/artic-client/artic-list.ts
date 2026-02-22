import { ArticArtwork } from './artic-details';

export interface ArticPagination {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
    next_url: string | null;
}

export interface ArticArtworksResponse {
    pagination: ArticPagination;
    data: ArticArtwork[];
    config: { iiif_url: string; website_url: string };
}

export interface ArticArtworksParams {
    page?: number;
    limit?: number;
    fields?: string[];
}
