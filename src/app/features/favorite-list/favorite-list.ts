import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Favorites } from '../../shared/data/favorites';
import { EmptyState } from '../../shared/ui/empty-state';
import { MasonryGrid } from '../../shared/ui/masonry-grid/masonry-grid';
import { MasonryGridCard } from '../../shared/ui/masonry-grid/masonry-grid-card';

@Component({
    selector: 'app-favorite-list',
    template: `
        @if (_artworks().length > 0) {
            <app-masonry-grid>
                @for (artwork of _artworks(); track artwork.id) {
                    <app-masonry-grid-card
                        [id]="artwork.id"
                        [title]="artwork.title"
                        [artist]="artwork.artist"
                        [subtitle]="artwork.subtitle"
                        [imageUrl]="artwork.imageUrl"
                        [lqip]="artwork.lqip"
                        [imageWidth]="artwork.thumbnailWidth"
                        [imageHeight]="artwork.thumbnailHeight"
                        (cardClick)="_openArtwork(artwork.id)"
                    />
                }
            </app-masonry-grid>
        } @else {
            <app-empty-state message="No favorite artworks found" />
        }
    `,
    styles: `
        :host {
            display: block;
        }
    `,
    imports: [MasonryGridCard, MasonryGrid, EmptyState],
})
export class FavoriteList {
    private readonly _favorites = inject(Favorites);

    private readonly _router = inject(Router);

    protected readonly _artworks = this._favorites.items;

    protected _openArtwork(id: number): void {
        this._router.navigate([id]);
    }
}
