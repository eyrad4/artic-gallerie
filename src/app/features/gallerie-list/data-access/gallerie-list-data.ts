import { computed, Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { exhaustMap, merge, Observable, Subject, scan, switchMap } from 'rxjs';
import { SearchQueryService } from '../../../shared/data/search-query';
import { ArtworkCard } from '../../../shared/models/artwork-card';
import { GallerieListApi, PageResult } from './gallerie-list-api';

type PageAccumulator = PageResult;

@Injectable()
export class GallerieListData {
    private readonly _api = inject(GallerieListApi);

    private readonly _searchQuery = inject(SearchQueryService);

    private readonly _artworks = signal<ArtworkCard[]>([]);

    private readonly _initialLoading = signal(true);

    private readonly _hasMore = signal(true);

    private readonly _currentPage = signal(0);

    private readonly _nextPage$ = new Subject<void>();

    private readonly _query$ = toObservable(this._searchQuery.query);

    readonly artworks = computed(() => this._artworks());

    readonly initialLoading = computed(() => this._initialLoading());

    readonly hasMore = computed(() => this._hasMore());

    constructor() {
        this._setupDataPipeline();
    }

    nextPage(): void {
        this._nextPage$.next();
    }

    private _setupDataPipeline(): void {
        this._query$
            .pipe(
                switchMap((q) => {
                    this._resetState();
                    return this._buildPaginatedStream(q);
                }),
            )
            .subscribe((state) => {
                this._artworks.set(state.items);
                this._initialLoading.set(false);
                this._currentPage.set(state.currentPage);
                this._hasMore.set(state.currentPage < state.totalPages);
            });
    }

    private _resetState(): void {
        this._artworks.set([]);
        this._initialLoading.set(true);
        this._hasMore.set(true);
        this._currentPage.set(0);
    }

    private _buildPaginatedStream(query: string): Observable<PageAccumulator> {
        const initialPage$ = this._api.fetch(query, 1);

        const nextPages$ = this._nextPage$.pipe(exhaustMap(() => this._api.fetch(query, this._currentPage() + 1)));

        return merge(initialPage$, nextPages$).pipe(
            scan(
                (acc, result) => ({
                    items: [...acc.items, ...result.items],
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                }),
                { items: [], totalPages: 1, currentPage: 0 } as PageAccumulator,
            ),
        );
    }
}
