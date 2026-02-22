export interface ArticThumbnail {
    lqip: string;
    width: number;
    height: number;
    alt_text: string | null;
}

export interface ArticArtwork {
    id: number;
    title: string;
    thumbnail: ArticThumbnail | null;
}

export interface ArticArtworkResponse {
    data: ArticArtwork;
    config: { iiif_url: string; website_url: string };
}
