import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { SearchQueryService } from '../../data/search-query';

@Component({
    selector: 'app-search-bar',
    template: `
        <div class="relative w-full group">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none transition-colors duration-200 group-focus-within:text-terracotta-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <title>Search</title>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
                #searchInput
                class="w-full h-10 pl-10 pr-10 border-[1.5px] border-gray-200 rounded-full bg-gray-0 font-body text-sm text-gray-900 outline-none transition-[border-color,box-shadow] duration-250 placeholder:text-gray-400 focus:border-terracotta-500 focus:shadow-[0_0_0_3px_var(--color-terracotta-50)]"
                type="text"
                placeholder="Search by artist..."
                (input)="_search()"
            >
            <div
                class="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-gray-200 border-t-terracotta-500 pointer-events-none transition-opacity duration-200 animate-spin"
                [class.opacity-0]="!_loading()"
            ></div>
        </div>
    `,
    styles: `
        :host {
            display: contents;
        }
    `,
})
export class SearchBar {
    private readonly _searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

    private readonly _searchQuery = inject(SearchQueryService);

    private _timeoutId: ReturnType<typeof setTimeout> | undefined;

    protected readonly _loading = signal(false);

    protected _search(): void {
        this._loading.set(true);
        clearTimeout(this._timeoutId);
        this._timeoutId = setTimeout(() => {
            this._loading.set(false);
            const value = this._searchInput().nativeElement.value.trim();
            this._searchQuery.query.set(value);
        }, 500);
    }
}
