import { ArticThumbnail } from './artic-thumbnail';

export interface ArticPagination {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
    next_url: string | null;
}

export interface ArticArtworkListItem {
    id: number;
    title: string;
    image_id: string | null;
    thumbnail: ArticThumbnail | null;
    artist_title: string | null;
    date_display: string | null;
    medium_display: string | null;
    category_titles: string[] | null;
}

export interface ArticArtworksResponse {
    pagination: ArticPagination;
    data: ArticArtworkListItem[];
    config: { iiif_url: string; website_url: string };
}

export interface ArticArtworksParams {
    page?: number;
    limit?: number;
    fields?: string[];
}
