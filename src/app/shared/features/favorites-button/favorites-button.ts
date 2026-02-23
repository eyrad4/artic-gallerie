import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { Favorites } from '../../data/favorites';
import { HeartIcon } from '../../ui/heart-icon';

@Component({
    selector: 'app-favorites-button',
    imports: [HeartIcon],
    template: `
        <button
            class="flex items-center gap-6 py-8 px-14 border-[1.5px] border-gray-200 rounded-full bg-gray-0 font-body text-ui text-gray-500 transition-all duration-250 enabled:cursor-pointer enabled:hover:border-terracotta-500 enabled:hover:text-terracotta-500 disabled:cursor-default"
            [class.border-terracotta-500]="_active()"
            [class.text-terracotta-500]="_active()"
            [disabled]="_isEmpty()"
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

    private readonly _router = inject(Router);

    private readonly _currentUrl = toSignal(
        this._router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map((e) => e.urlAfterRedirects),
        ),
        { initialValue: this._router.url },
    );

    protected readonly _active = computed(() => {
        console.log(this._currentUrl());
        return this._currentUrl() === '/favorites';
    });

    protected _isEmpty = computed(() => {
        return this._favorites.count() === 0;
    });

    protected readonly _count = this._favorites.count;

    protected _toFavorites(): void {
        if (this._favorites.count() > 0) {
            this._router.navigate(['/favorites']);
        }
    }
}
