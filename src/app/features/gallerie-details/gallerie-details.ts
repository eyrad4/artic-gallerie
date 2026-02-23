import { Location, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Favorites } from '../../shared/data/favorites';
import { HeartIcon } from '../../shared/ui/heart-icon';
import { ImagePlaceholder } from '../../shared/ui/image-placeholder';
import { buildArtworkSubtitle } from '../../shared/utils/build-artwork-subtitle';
import { GallerieDetailsApi } from './data-access/gallerie-details-api';
import { DetailsError } from './ui/details-error';
import { DetailsSkeleton } from './ui/details-skeleton';

@Component({
    selector: 'app-gallerie-details',
    imports: [NgOptimizedImage, HeartIcon, ImagePlaceholder, DetailsSkeleton, DetailsError],
    templateUrl: './gallerie-details.html',
    styles: `
        :host {
            display: block;
        }
    `,
    providers: [GallerieDetailsApi],
})
export class GallerieDetails {
    private _gallerieDetailsApi = inject(GallerieDetailsApi);

    private readonly _favorites = inject(Favorites);

    private readonly _location = inject(Location);

    private readonly _router = inject(Router);

    protected readonly _isFavorite = computed(() => {
        const artwork = this.gallerieDetails.value();
        return artwork ? this._favorites.ids().has(artwork.id) : false;
    });

    readonly id = input.required({ transform: (value: string) => Number(value) });

    readonly gallerieDetails = this._gallerieDetailsApi.detailsResource(this.id);

    protected readonly _imageError = signal(false);

    protected _goBack(): void {
        if (window.history.length > 1) {
            this._location.back();
        } else {
            this._router.navigate(['/']);
        }
    }

    protected _toggleFavorite(): void {
        const data = this.gallerieDetails.value();
        if (!data) {
            return;
        }

        const subtitle = buildArtworkSubtitle(data.year ?? '', data.medium ?? '');

        this._favorites.upsert({
            id: data.id,
            title: data.title,
            artist: data.artist,
            imageUrl: data.imageUrl,
            categories: data.categories,
            thumbnailWidth: data.thumbnailWidth,
            thumbnailHeight: data.thumbnailHeight,
            lqip: data.lqip,
            subtitle,
        });
    }
}
