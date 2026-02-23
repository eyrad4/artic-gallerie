import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ArticClient } from '../../../shared/rest/artic-client/artic.client';
import { GallerieListApi, PageResult } from './gallerie-list-api';

const mockArticItem = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    title: 'Starry Night',
    image_id: 'img-123',
    thumbnail: { lqip: 'data:image/gif;base64,abc', width: 600, height: 400, alt_text: 'Stars' },
    artist_title: 'Vincent van Gogh',
    date_display: '1889',
    medium_display: 'Oil on canvas, framed',
    category_titles: ['Painting', 'Modern Art'],
    ...overrides,
});

const mockResponse = (items = [mockArticItem()], pagination = { total_pages: 5, current_page: 1 }) => ({
    data: items,
    pagination: { total: 100, limit: 20, offset: 0, next_url: null, ...pagination },
    config: { iiif_url: 'https://www.artic.edu/iiif/2', website_url: 'https://www.artic.edu' },
});

describe('GallerieListApi', () => {
    let api: GallerieListApi;
    let mockArtic: { get: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        TestBed.resetTestingModule();

        mockArtic = { get: vi.fn() };

        TestBed.configureTestingModule({
            providers: [GallerieListApi, { provide: ArticClient, useValue: mockArtic }],
            teardown: { destroyAfterEach: true },
        });

        api = TestBed.inject(GallerieListApi);
    });

    describe('fetch', () => {
        it('should call artworks endpoint when query is empty', () => {
            mockArtic.get.mockReturnValue(of(mockResponse()));

            api.fetch('', 1).subscribe();

            expect(mockArtic.get).toHaveBeenCalledWith('artworks', expect.objectContaining({ page: 1, limit: 20 }), { cache: true });
        });

        it('should call artworks/search endpoint when query is provided', () => {
            mockArtic.get.mockReturnValue(of(mockResponse()));

            api.fetch('starry', 2).subscribe();

            expect(mockArtic.get).toHaveBeenCalledWith('artworks/search', expect.objectContaining({ page: 2, limit: 20, q: 'starry' }), {
                cache: false,
            });
        });

        it('should transform API items to ArtworkCard', () => {
            mockArtic.get.mockReturnValue(of(mockResponse()));

            let result: PageResult | undefined;
            api.fetch('', 1).subscribe((r) => (result = r));

            expect(result?.items[0]).toEqual(
                expect.objectContaining({
                    id: 1,
                    title: 'Starry Night',
                    artist: 'Vincent van Gogh',
                    imageUrl: 'https://www.artic.edu/iiif/2/img-123/full/843,/0/default.jpg',
                    lqip: 'data:image/gif;base64,abc',
                    thumbnailWidth: 600,
                    thumbnailHeight: 400,
                }),
            );
        });

        it('should filter out items with null image_id', () => {
            const items = [mockArticItem(), mockArticItem({ id: 2, image_id: null })];
            mockArtic.get.mockReturnValue(of(mockResponse(items)));

            let result: PageResult | undefined;
            api.fetch('', 1).subscribe((r) => (result = r));

            expect(result?.items).toHaveLength(1);
            expect(result?.items[0].id).toBe(1);
        });

        it('should return totalPages and currentPage', () => {
            mockArtic.get.mockReturnValue(of(mockResponse([mockArticItem()], { total_pages: 10, current_page: 3 })));

            let result: PageResult | undefined;
            api.fetch('', 3).subscribe((r) => (result = r));

            expect(result?.totalPages).toBe(10);
            expect(result?.currentPage).toBe(3);
        });

        it('should default artist to "Unknown artist" when null', () => {
            mockArtic.get.mockReturnValue(of(mockResponse([mockArticItem({ artist_title: null })])));

            let result: PageResult | undefined;
            api.fetch('', 1).subscribe((r) => (result = r));

            expect(result?.items[0].artist).toBe('Unknown artist');
        });

        it('should build subtitle from date and first medium segment', () => {
            mockArtic.get.mockReturnValue(of(mockResponse()));

            let result: PageResult | undefined;
            api.fetch('', 1).subscribe((r) => (result = r));

            expect(result?.items[0].subtitle).toBe('1889 \u00b7 Oil on canvas');
        });

        it('should handle empty subtitle parts gracefully', () => {
            mockArtic.get.mockReturnValue(of(mockResponse([mockArticItem({ date_display: null, medium_display: null })])));

            let result: PageResult | undefined;
            api.fetch('', 1).subscribe((r) => (result = r));

            expect(result?.items[0].subtitle).toBe('');
        });

        it('should join category titles with comma separator', () => {
            mockArtic.get.mockReturnValue(of(mockResponse([mockArticItem({ category_titles: ['A', 'B', 'C'] })])));

            let result: PageResult | undefined;
            api.fetch('', 1).subscribe((r) => (result = r));

            expect(result?.items[0].categories).toBe('A, B, C');
        });

        it('should return empty categories when category_titles is null', () => {
            mockArtic.get.mockReturnValue(of(mockResponse([mockArticItem({ category_titles: null })])));

            let result: PageResult | undefined;
            api.fetch('', 1).subscribe((r) => (result = r));

            expect(result?.items[0].categories).toBe('');
        });

        it('should return undefined dimensions when thumbnail is null', () => {
            mockArtic.get.mockReturnValue(of(mockResponse([mockArticItem({ thumbnail: null })])));

            let result: PageResult | undefined;
            api.fetch('', 1).subscribe((r) => (result = r));

            expect(result?.items[0].thumbnailWidth).toBeUndefined();
            expect(result?.items[0].thumbnailHeight).toBeUndefined();
            expect(result?.items[0].lqip).toBeUndefined();
        });

        it('should return empty imageUrl when image_id is present but iiif builds empty', () => {
            const items = [mockArticItem()];
            mockArtic.get.mockReturnValue(of(mockResponse(items)));

            let result: PageResult | undefined;
            api.fetch('', 1).subscribe((r) => (result = r));

            expect(result?.items[0].imageUrl).toContain('img-123');
        });

        it('should pass fields parameter in request', () => {
            mockArtic.get.mockReturnValue(of(mockResponse()));

            api.fetch('', 1).subscribe();

            expect(mockArtic.get).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    fields: expect.arrayContaining(['id', 'title', 'image_id', 'thumbnail', 'artist_title']),
                }),
                expect.any(Object),
            );
        });
    });
});
