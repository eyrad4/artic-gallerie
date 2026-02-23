import { Component, DestroyRef, ElementRef, effect, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Favorites } from '../../shared/data/favorites';
import { MasonryGrid } from '../../shared/ui/masonry-grid/masonry-grid';
import { MasonryGridCard } from '../../shared/ui/masonry-grid/masonry-grid-card';
import { GallerieListApi } from './data-access/gallerie-list-api';
import { GallerieListData } from './data-access/gallerie-list-data';

@Component({
    selector: 'app-gallerie-list',
    imports: [MasonryGrid, MasonryGridCard],
    providers: [GallerieListData, GallerieListApi],
    template: `
        @if (_artworkList.initialLoading()) {
            <app-masonry-grid>
                @for (s of _skeletonCards; track s.id) {
                    <app-masonry-grid-card
                        [id]="s.id"
                        title=""
                        imageUrl=""
                        [imageWidth]="s.w"
                        [imageHeight]="s.h"
                        [loading]="true"
                    />
                }
            </app-masonry-grid>
        } @else if (_artworkList.artworks().length === 0) {
            <div class="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg class="size-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <p class="font-display text-lg">No artworks found</p>
                <p class="text-sm mt-1">Try a different search term</p>
            </div>
        } @else {
            <app-masonry-grid>
                @for (artwork of _artworkList.artworks(); track artwork.id; let index = $index) {
                    <app-masonry-grid-card
                        [id]="artwork.id"
                        [title]="artwork.title"
                        [artist]="artwork.artist"
                        [subtitle]="artwork.subtitle"
                        [imageUrl]="artwork.imageUrl"
                        [lqip]="artwork.lqip"
                        [imageWidth]="artwork.thumbnailWidth"
                        [imageHeight]="artwork.thumbnailHeight"
                        [priority]="index < 4"
                        [favorite]="_favorites.ids().has(artwork.id)"
                        (cardClick)="_openArtwork(artwork.id)"
                        (favoriteToggle)="_favorites.upsert(artwork)"
                    />
                }
            </app-masonry-grid>
            @if (_artworkList.hasMore()) {
                <div #sentinel class="flex justify-center py-8">
                    <div class="size-20 rounded-full border-4 border-gray-200 border-t-terracotta-500 animate-spin"></div>
                </div>
            }
        }
    `,
    styles: `
        :host {
            display: block;
        }
    `,
})
export class GallerieList {
    private readonly _router = inject(Router);

    private readonly _destroyRef = inject(DestroyRef);

    private readonly _sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');

    private _observer: IntersectionObserver | undefined;

    protected readonly _artworkList = inject(GallerieListData);

    protected readonly _favorites = inject(Favorites);

    protected readonly _skeletonCards = [
        { id: -1, w: 300, h: 400 },
        { id: -2, w: 400, h: 300 },
        { id: -3, w: 300, h: 350 },
        { id: -4, w: 350, h: 500 },
        { id: -5, w: 400, h: 350 },
        { id: -6, w: 300, h: 380 },
        { id: -7, w: 350, h: 280 },
        { id: -8, w: 300, h: 420 },
    ];

    constructor() {
        effect(() => {
            const sentinelRef = this._sentinel();
            this._observer?.disconnect();

            if (sentinelRef) {
                this._observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            this._artworkList.nextPage();
                        }
                    },
                    { rootMargin: '200px' },
                );
                this._observer.observe(sentinelRef.nativeElement);
            }
        });

        this._destroyRef.onDestroy(() => {
            this._observer?.disconnect();
        });
    }

    protected _openArtwork(id: number): void {
        this._router.navigate([id]);
    }
}
