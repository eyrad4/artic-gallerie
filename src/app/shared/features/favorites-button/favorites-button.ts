import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-favorites-button',
    template: `
        <button
            class="flex items-center gap-6 py-8 px-14 border-[1.5px] border-gray-200 rounded-full bg-gray-0 cursor-pointer font-body text-[0.8rem] text-gray-500 transition-all duration-250 hover:border-terracotta-500 hover:text-terracotta-500"
            [class.border-terracotta-500]="_active()"
            [class.text-terracotta-500]="_active()"
            title="View favorites"
            (click)="_toFavorites()"
        >
            <svg class="size-4 transition-transform duration-250 hover:scale-115" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            @if (_count() > 0) {
                <span class="inline-flex items-center justify-center min-w-18 h-18 px-5 bg-terracotta-500 text-white text-[0.65rem] font-medium rounded-full animate-scale-in">
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
    protected readonly _active = signal(false);

    protected readonly _count = signal(0);

    protected _toFavorites(): void {
        // TODO: link to favorites page
    }
}
