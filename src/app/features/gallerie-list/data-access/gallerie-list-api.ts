import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ArtworkCard } from '../../../shared/models/artwork-card';
import { ArticClient } from '../../../shared/rest/artic-client/artic.client';
import { ArticArtworkListItem } from '../../../shared/rest/artic-client/artic-list';
import { transformToArtworkCard } from '../../../shared/utils/tranform-to-artwork-card';

export interface PageResult {
    items: ArtworkCard[];
    totalPages: number;
    currentPage: number;
}

const PAGE_LIMIT = 20;

const FIELDS = ['id', 'title', 'image_id', 'thumbnail', 'artist_title', 'date_display', 'medium_display'];

@Injectable()
export class GallerieListApi {
    private readonly _artic = inject(ArticClient);

    fetch(query: string, page: number): Observable<PageResult> {
        const params = { page, limit: PAGE_LIMIT, fields: FIELDS };
        const req$ = query
            ? this._artic.get('artworks/search', { ...params, q: query }, { cache: false })
            : this._artic.get('artworks', params, { cache: true });

        return req$.pipe(
            map((res) => ({
                items: res.data
                    .filter((item: ArticArtworkListItem) => item.image_id !== null)
                    .map((item: ArticArtworkListItem) => transformToArtworkCard(item, res.config.iiif_url)),
                totalPages: res.pagination.total_pages,
                currentPage: res.pagination.current_page,
            })),
        );
    }
}
