export interface ArtworkCard {
    id: number;
    title: string;
    artist: string;
    subtitle: string;
    imageUrl: string;
    lqip: string | undefined;
    thumbnailWidth: number | undefined;
    thumbnailHeight: number | undefined;
}
