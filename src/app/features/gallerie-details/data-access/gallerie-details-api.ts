import { Injectable, inject, Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ArticClient } from '../../../shared/rest/artic-client/artic.client';
import { ArticArtworkResponse } from '../../../shared/rest/artic-client/artic-details';
import { buildIiifImageUrl } from '../../../shared/utils/build-iiif-image-url';

const DETAIL_FIELDS = [
    'id',
    'title',
    'image_id',
    'thumbnail',
    'artist_title',
    'date_display',
    'medium_display',
    'dimensions',
    'description',
    'short_description',
    'department_title',
    'category_titles',
];

interface ArtworkDetails {
    id: number;
    title: string;
    artist: string;
    year: string;
    medium: string;
    dimensions: string;
    collection: string;
    description: string;
    imageUrl: string;
    imageId: string | null;
    lqip: string | undefined;
    museumUrl: string;
    categories: string;
    thumbnailWidth: number | undefined;
    thumbnailHeight: number | undefined;
}

@Injectable()
export class GallerieDetailsApi {
    private readonly _artic = inject(ArticClient);

    detailsResource = (id: Signal<number | undefined>) =>
        rxResource<ArtworkDetails, number | undefined>({
            params: () => id(),
            stream: ({ params }) => {
                if (!params) {
                    new Error('Param id must be exist');
                }

                return this._artic
                    .get('artworks/:id', {
                        id: params,
                        fields: DETAIL_FIELDS,
                    })
                    .pipe(map((res) => this.transformToArtworkDetails(res)));
            },
        });

    private transformToArtworkDetails(res: ArticArtworkResponse): ArtworkDetails {
        const data = res.data;
        const iiifUrl = res.config.iiif_url;
        const websiteUrl = res.config.website_url;
        return {
            id: data.id,
            title: data.title,
            artist: data.artist_title ?? 'Unknown artist',
            year: data.date_display ?? '',
            medium: data.medium_display ?? '',
            dimensions: data.dimensions ?? '',
            collection: data.department_title ?? 'Art Institute of Chicago',
            description: this._stripHtml(data.description ?? data.short_description ?? ''),
            imageUrl: buildIiifImageUrl(iiifUrl, data.image_id, 1686),
            thumbnailWidth: data.thumbnail?.width ?? undefined,
            thumbnailHeight: data.thumbnail?.height ?? undefined,
            imageId: data.image_id,
            lqip: data.thumbnail?.lqip ?? undefined,
            museumUrl: `${websiteUrl}/artworks/${data.id}`,
            categories: data.category_titles ? data.category_titles.join(', ') : '',
        };
    }

    private _stripHtml(html: string): string {
        return html.replace(/<[^>]*>/g, '');
    }
}
