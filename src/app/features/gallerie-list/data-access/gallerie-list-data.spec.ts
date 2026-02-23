import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SearchQueryService } from '../../../shared/data/search-query';
import { ArtworkCard } from '../../../shared/models/artwork-card';
import { GallerieListApi, PageResult } from './gallerie-list-api';
import { GallerieListData } from './gallerie-list-data';

const mockCard = (overrides: Partial<ArtworkCard> = {}): ArtworkCard => ({
    id: 1,
    title: 'Art 1',
    artist: 'Artist 1',
    subtitle: '',
    imageUrl: 'https://example.com/img.jpg',
    lqip: undefined,
    categories: '',
    thumbnailWidth: 300,
    thumbnailHeight: 400,
    ...overrides,
});

const mockPageResult = (overrides: Partial<PageResult> = {}): PageResult => ({
    items: [mockCard()],
    totalPages: 3,
    currentPage: 1,
    ...overrides,
});

async function flush() {
    TestBed.flushEffects();
    await Promise.resolve();
    TestBed.flushEffects();
    await Promise.resolve();
}

describe('GallerieListData', () => {
    let data: GallerieListData;
    let searchQuery: SearchQueryService;
    let mockApi: { fetch: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        TestBed.resetTestingModule();

        mockApi = { fetch: vi.fn().mockReturnValue(of(mockPageResult())) };

        await TestBed.configureTestingModule({
            providers: [GallerieListData, { provide: GallerieListApi, useValue: mockApi }, SearchQueryService],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        searchQuery = TestBed.inject(SearchQueryService);
        data = TestBed.inject(GallerieListData);
    });

    it('should start with initialLoading true', () => {
        expect(data.initialLoading()).toBe(true);
    });

    it('should fetch first page on init', async () => {
        await flush();

        expect(mockApi.fetch).toHaveBeenCalledWith('', 1);
    });

    it('should set artworks after fetch', async () => {
        await flush();

        expect(data.artworks()).toHaveLength(1);
        expect(data.artworks()[0].id).toBe(1);
    });

    it('should set initialLoading to false after fetch', async () => {
        await flush();

        expect(data.initialLoading()).toBe(false);
    });

    it('should set hasMore to true when currentPage < totalPages', async () => {
        await flush();

        expect(data.hasMore()).toBe(true);
    });

    it('should set hasMore to false on last page', async () => {
        mockApi.fetch.mockReturnValue(of(mockPageResult({ totalPages: 1, currentPage: 1 })));

        await flush();

        expect(data.hasMore()).toBe(false);
    });

    describe('nextPage', () => {
        it('should fetch next page and accumulate items', async () => {
            const page2Card = mockCard({ id: 2, title: 'Art 2' });
            mockApi.fetch
                .mockReturnValueOnce(of(mockPageResult()))
                .mockReturnValueOnce(of(mockPageResult({ items: [page2Card], currentPage: 2, totalPages: 3 })));

            await flush();
            expect(data.artworks()).toHaveLength(1);

            data.nextPage();
            await flush();

            expect(data.artworks()).toHaveLength(2);
            expect(data.artworks()[1].id).toBe(2);
        });

        it('should call api with incremented page number', async () => {
            mockApi.fetch.mockReturnValueOnce(of(mockPageResult())).mockReturnValueOnce(of(mockPageResult({ currentPage: 2 })));

            await flush();

            data.nextPage();
            await flush();

            expect(mockApi.fetch).toHaveBeenCalledWith('', 2);
        });
    });

    describe('query change', () => {
        it('should reset and refetch when query changes', async () => {
            await flush();
            expect(data.artworks()).toHaveLength(1);

            const newCard = mockCard({ id: 99, title: 'New Art' });
            mockApi.fetch.mockReturnValue(of(mockPageResult({ items: [newCard] })));

            searchQuery.query.set('new search');
            await flush();

            expect(mockApi.fetch).toHaveBeenCalledWith('new search', 1);
            expect(data.artworks()[0].id).toBe(99);
        });

        it('should reset initialLoading on query change', async () => {
            await flush();
            expect(data.initialLoading()).toBe(false);

            mockApi.fetch.mockReturnValue(of(mockPageResult()));

            searchQuery.query.set('test');
            await flush();

            expect(data.initialLoading()).toBe(false);
        });

        it('should reset hasMore on query change', async () => {
            mockApi.fetch.mockReturnValue(of(mockPageResult({ totalPages: 1, currentPage: 1 })));

            await flush();
            expect(data.hasMore()).toBe(false);

            mockApi.fetch.mockReturnValue(of(mockPageResult({ totalPages: 5, currentPage: 1 })));

            searchQuery.query.set('test');
            await flush();

            expect(data.hasMore()).toBe(true);
        });
    });
});
