import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { type Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GallerieDetailsApi } from './gallerie-details-api';

const mockArtworkResponse = (overrides: Record<string, unknown> = {}) => ({
    data: {
        id: 1,
        title: 'Starry Night',
        image_id: 'img-123',
        thumbnail: { lqip: 'data:image/gif;base64,abc', width: 600, height: 400, alt_text: 'Stars' },
        artist_title: 'Vincent van Gogh',
        date_display: '1889',
        medium_display: 'Oil on canvas',
        dimensions: '73.7 cm × 92.1 cm',
        description: '<p>A painting of stars</p>',
        short_description: 'Stars at night',
        department_title: 'European Painting',
        category_titles: ['Painting', 'Modern Art'],
        ...overrides,
    },
    config: {
        iiif_url: 'https://www.artic.edu/iiif/2',
        website_url: 'https://www.artic.edu',
    },
});

const matchUrl = (expected: string) => (req: { url: string }) => req.url.startsWith(expected);

function createResource(api: GallerieDetailsApi, id: Signal<number | undefined>) {
    return TestBed.runInInjectionContext(() => api.detailsResource(id));
}

async function flushResource() {
    TestBed.flushEffects();
    await Promise.resolve();
    TestBed.flushEffects();
    await Promise.resolve();
}

describe('GallerieDetailsApi', () => {
    let api: GallerieDetailsApi;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), GallerieDetailsApi],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        api = TestBed.inject(GallerieDetailsApi);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    describe('detailsResource', () => {
        it('should fetch artwork details by id', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            expect(req.request.method).toBe('GET');
            req.flush(mockArtworkResponse());

            await flushResource();

            const value = resource.value();
            expect(value?.id).toBe(1);
            expect(value?.title).toBe('Starry Night');
            expect(value?.artist).toBe('Vincent van Gogh');
        });

        it('should transform API response to ArtworkDetails', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            req.flush(mockArtworkResponse());

            await flushResource();

            const value = resource.value();
            expect(value).toEqual(
                expect.objectContaining({
                    id: 1,
                    title: 'Starry Night',
                    artist: 'Vincent van Gogh',
                    year: '1889',
                    medium: 'Oil on canvas',
                    dimensions: '73.7 cm × 92.1 cm',
                    collection: 'European Painting',
                    description: 'A painting of stars',
                    categories: 'Painting, Modern Art',
                    museumUrl: 'https://www.artic.edu/artworks/1',
                }),
            );
        });

        it('should build IIIF image URL', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            req.flush(mockArtworkResponse());

            await flushResource();

            expect(resource.value()?.imageUrl).toBe('https://www.artic.edu/iiif/2/img-123/full/1686,/0/default.jpg');
        });

        it('should strip HTML from description', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            req.flush(mockArtworkResponse({ description: '<b>Bold</b> and <i>italic</i>' }));

            await flushResource();

            expect(resource.value()?.description).toBe('Bold and italic');
        });

        it('should fallback to short_description when description is null', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            req.flush(mockArtworkResponse({ description: null, short_description: 'Short desc' }));

            await flushResource();

            expect(resource.value()?.description).toBe('Short desc');
        });

        it('should default artist to "Unknown artist" when null', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            req.flush(mockArtworkResponse({ artist_title: null }));

            await flushResource();

            expect(resource.value()?.artist).toBe('Unknown artist');
        });

        it('should return empty string for imageUrl when image_id is null', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            req.flush(mockArtworkResponse({ image_id: null }));

            await flushResource();

            expect(resource.value()?.imageUrl).toBe('');
        });

        it('should not fetch when id is undefined', async () => {
            const id = signal<number | undefined>(undefined);
            createResource(api, id);

            await flushResource();

            httpTesting.expectNone(() => true);
        });

        it('should not fetch when id is NaN', async () => {
            const id = signal<number | undefined>(Number.NaN);
            createResource(api, id);

            await flushResource();

            httpTesting.expectNone(() => true);
        });

        it('should join category titles with comma separator', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            req.flush(mockArtworkResponse({ category_titles: ['A', 'B', 'C'] }));

            await flushResource();

            expect(resource.value()?.categories).toBe('A, B, C');
        });

        it('should return empty categories when category_titles is null', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            req.flush(mockArtworkResponse({ category_titles: null }));

            await flushResource();

            expect(resource.value()?.categories).toBe('');
        });

        it('should extract thumbnail dimensions', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            req.flush(mockArtworkResponse());

            await flushResource();

            expect(resource.value()?.thumbnailWidth).toBe(600);
            expect(resource.value()?.thumbnailHeight).toBe(400);
        });

        it('should return undefined dimensions when thumbnail is null', async () => {
            const id = signal<number | undefined>(1);
            const resource = createResource(api, id);

            await flushResource();

            const req = httpTesting.expectOne(matchUrl('https://api.artic.edu/api/v1/artworks/1'));
            req.flush(mockArtworkResponse({ thumbnail: null }));

            await flushResource();

            expect(resource.value()?.thumbnailWidth).toBeUndefined();
            expect(resource.value()?.thumbnailHeight).toBeUndefined();
            expect(resource.value()?.lqip).toBeUndefined();
        });
    });
});
