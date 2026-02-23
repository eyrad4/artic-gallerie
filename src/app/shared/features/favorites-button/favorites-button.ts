import { Component, inject, signal } from '@angular/core';
import { Favorites } from '../../data/favorites';
import { HeartIcon } from '../../ui/heart-icon';

@Component({
    selector: 'app-favorites-button',
    imports: [HeartIcon],
    template: `
        <button
            class="flex items-center gap-6 py-8 px-14 border-[1.5px] border-gray-200 rounded-full bg-gray-0 cursor-pointer font-body text-ui text-gray-500 transition-all duration-250 hover:border-terracotta-500 hover:text-terracotta-500"
            [class.border-terracotta-500]="_active()"
            [class.text-terracotta-500]="_active()"
            title="View favorites"
            (click)="_toFavorites()"
        >
            <app-heart-icon class="size-4 transition-transform duration-250 hover:scale-115" />
            @if (_count() > 0) {
                <span class="inline-flex items-center justify-center min-w-18 h-18 px-5 bg-terracotta-500 text-white text-2xs font-medium rounded-full animate-scale-in">
                    {{ _count() }}
                </span>
            }
        </button>
    `,
    styles: `
        :host {
            display: contents;
        }
    `,
})
export class FavoritesButton {
    private readonly _favorites = inject(Favorites);

    protected readonly _active = signal(false);

    protected readonly _count = this._favorites.count;

    protected _toFavorites(): void {
        // TODO: link to favorites page
    }
}
