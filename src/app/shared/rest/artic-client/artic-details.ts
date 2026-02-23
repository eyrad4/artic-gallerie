import { ArticThumbnail } from './artic-thumbnail';

export interface ArticArtwork {
    id: number;
    title: string;
    image_id: string | null;
    thumbnail: ArticThumbnail | null;
    artist_title: string | null;
    date_display: string | null;
    medium_display: string | null;
    dimensions: string | null;
    description: string | null;
    short_description: string | null;
    place_of_origin: string | null;
    department_title: string | null;
    gallery_title: string | null;
    category_titles: string[] | null;
}

export interface ArticArtworkResponse {
    data: ArticArtwork;
    config: { iiif_url: string; website_url: string };
}
