import { computed, Injectable, signal } from '@angular/core';
import { ArticArtworkListItem } from '../rest/artic-client/artic-list';

@Injectable({
    providedIn: 'root',
})
export class Favorites {
    private readonly _state = signal(new Map<number, ArticArtworkListItem>());

    readonly items = computed(() => [...this._state().values()]);

    readonly ids = computed(() => new Set(this._state().keys()));

    readonly count = computed(() => this._state().size);

    isFavorite(id: number): boolean {
        return this._state().has(id);
    }

    upsert(item: ArticArtworkListItem): void {
        this._state.update((map) => {
            const next = new Map(map);
            if (next.has(item.id)) {
                next.delete(item.id);
            } else {
                next.set(item.id, item);
            }
            return next;
        });
    }
}
