import { ArtworkCard } from '../models/artwork-card';
import { ArticArtworkListItem } from '../rest/artic-client/artic-list';

export const transformToArtworkCard = (data: ArticArtworkListItem, iiifUrl: string): ArtworkCard => {
    const medium = data.medium_display?.split(',')[0] ?? '';
    const date = data.date_display ?? '';
    const subtitle = [date, medium].filter(Boolean).join(' \u00b7 ');
    return {
        id: data.id,
        title: data.title,
        artist: data.artist_title ?? 'Unknown',
        subtitle,
        imageUrl: `${iiifUrl}/${data.image_id}/full/843,/0/default.jpg`,
        lqip: data.thumbnail?.lqip ?? undefined,
        thumbnailWidth: data.thumbnail?.width ?? undefined,
        thumbnailHeight: data.thumbnail?.height ?? undefined,
    };
};
