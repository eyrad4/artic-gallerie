import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { HeartIcon } from '../heart-icon';
import { ImagePlaceholder } from '../image-placeholder';
import { Skeleton } from '../skeleton';

@Component({
    selector: 'app-masonry-grid-card',
    imports: [NgOptimizedImage, HeartIcon, ImagePlaceholder, Skeleton],
    host: {
        class: 'block absolute top-0 left-0',
    },
    template: `
        @if (loading()) {
            <div class="rounded-lg bg-white shadow-sm overflow-hidden">
                <app-skeleton [aspectRatio]="_aspectRatio()" />
                <div class="px-4 pt-3.5 pb-4">
                    <app-skeleton height="1rem" width="75%" />
                </div>
            </div>
        } @else {
            <div class="card group cursor-pointer rounded-lg bg-white shadow-sm overflow-hidden" (click)="cardClick.emit()">
                <div
                    class="relative overflow-hidden bg-gray-100"
                    [style.aspect-ratio]="_aspectRatio()"
                >
                    @if (_imageError()) {
                        <app-image-placeholder />
                    } @else {
                        <img
                            [ngSrc]="imageUrl()"
                            alt=""
                            [alt]="title()"
                            fill
                            [priority]="priority()"
                            style="object-fit: cover"
                            [style.background]="lqip() ? 'url(' + lqip() + ') center/cover' : null"
                            (load)="imageLoaded.emit()"
                            (error)="_imageError.set(true)"
                        />
                    }
                    <button
                        class="fav-btn absolute top-2.5 right-2.5 size-[34px] rounded-full bg-white/90 border-none cursor-pointer flex items-center justify-center opacity-0 scale-[0.8] group-hover:opacity-100 group-hover:scale-100 transition-[opacity,transform,background] duration-250 ease-spring z-2"
                        [class.active]="favorite()"
                        (click)="_favoriteClick($event)"
                        aria-label="Toggle favorite"
                    >
                        <app-heart-icon class="size-4 text-gray-500 transition-[color,transform] duration-200 ease-spring hover:scale-[1.15]" [filled]="favorite()" fillColor="white" />
                    </button>
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3.5 pt-12 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-300">
                        <div class="text-xs text-white/75 mt-3 tracking-[0.02em]">{{ categories() }}</div>
                    </div>
                </div>
                <div class="px-4 pt-3 pb-3">
                    <div class="font-display text-base font-medium leading-tight text-gray-900">{{ title() }}</div>
                    <div class="text-xs text-gray-500 mt-3 tracking-[0.02em]">{{ artist() }}</div>
                    @if (subtitle()) {
                        <div class="text-caption text-gray-400 mt-1">{{ subtitle() }}</div>
                    }
                </div>
            </div>
        }
    `,
    styles: `
        .card {
            position: relative;

            &::after {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: inherit;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08), 0 3px 10px rgba(0, 0, 0, 0.04);
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
            }

            &:hover::after {
                opacity: 1;
            }
        }

        .fav-btn.active {
            opacity: 1;
            transform: scale(1);
            background: var(--color-terracotta-500);

            svg {
                color: white;
            }
        }
    `,
})
export class MasonryGridCard {
    protected readonly _aspectRatio = computed(() => {
        const w = this.imageWidth();
        const h = this.imageHeight();
        return w && h ? `${w} / ${h}` : '3 / 4';
    });

    protected readonly _imageError = signal(false);

    protected _favoriteClick(event: Event): void {
        event.stopPropagation();
        this.favoriteToggle.emit();
    }

    readonly id = input.required<number>();

    readonly title = input.required<string>();

    readonly artist = input('');

    readonly subtitle = input('');

    readonly imageUrl = input.required<string>();

    readonly lqip = input<string>();

    readonly favorite = input(false);

    readonly imageWidth = input<number>();

    readonly imageHeight = input<number>();

    readonly loading = input(false);

    readonly priority = input(false);

    readonly categories = input<string>();

    readonly cardClick = output<void>();

    readonly favoriteToggle = output<void>();

    readonly imageLoaded = output<void>();
}
