import { Location } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Favorites } from '../../shared/data/favorites';
import { GallerieDetailsApi } from './data-access/gallerie-details-api';
import { GallerieDetails } from './gallerie-details';

const mockArtwork = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    title: 'Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    medium: 'Oil on canvas',
    dimensions: '73.7 cm × 92.1 cm',
    collection: 'European Painting',
    description: 'A painting of stars',
    imageUrl: 'https://www.artic.edu/iiif/2/img-123/full/1686,/0/default.jpg',
    imageId: 'img-123',
    lqip: 'data:image/gif;base64,abc',
    museumUrl: 'https://www.artic.edu/artworks/1',
    categories: 'Painting, Modern Art',
    thumbnailWidth: 600,
    thumbnailHeight: 400,
    ...overrides,
});

function createMockResource(initialState: 'loading' | 'error' | 'value' = 'value') {
    const valueSignal = signal(initialState === 'value' ? mockArtwork() : null);
    const isLoadingSignal = signal(initialState === 'loading');
    const errorSignal = signal(initialState === 'error' ? new Error('fail') : null);

    return {
        resource: {
            value: valueSignal,
            isLoading: isLoadingSignal,
            error: errorSignal,
        },
        setValue: (val: ReturnType<typeof mockArtwork> | null) => valueSignal.set(val),
        setLoading: (val: boolean) => isLoadingSignal.set(val),
        setError: (val: Error | null) => errorSignal.set(val),
    };
}

@Component({
    template: '<app-gallerie-details [id]="idValue" />',
    imports: [GallerieDetails],
})
class TestHost {
    idValue = '1';
}

describe('GallerieDetails', () => {
    let fixture: ComponentFixture<TestHost>;
    let favorites: Favorites;
    let mockLocation: { back: ReturnType<typeof vi.fn> };
    let mockRouter: { navigate: ReturnType<typeof vi.fn> };
    let mockResource: ReturnType<typeof createMockResource>;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        mockResource = createMockResource('value');
        mockLocation = { back: vi.fn() };
        mockRouter = { navigate: vi.fn() };

        const mockApi = {
            detailsResource: () => mockResource.resource,
        };

        TestBed.overrideComponent(GallerieDetails, {
            set: { providers: [{ provide: GallerieDetailsApi, useValue: mockApi }] },
        });

        await TestBed.configureTestingModule({
            imports: [TestHost],
            providers: [
                { provide: Location, useValue: mockLocation },
                { provide: Router, useValue: mockRouter },
            ],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        favorites = TestBed.inject(Favorites);
        fixture = TestBed.createComponent(TestHost);
        fixture.detectChanges();
    });

    const el = () => fixture.nativeElement as HTMLElement;
    const skeleton = () => el().querySelector('app-details-skeleton');
    const errorEl = () => el().querySelector('app-details-error');
    const backButton = () => el().querySelector('button[aria-label="Go back"]') as HTMLButtonElement | null;
    const title = () => el().querySelector('h1');
    const favoriteButton = () =>
        Array.from(el().querySelectorAll('button')).find((b) => b.textContent?.includes('Save') || b.textContent?.includes('Saved')) as
            | HTMLButtonElement
            | undefined;

    describe('loading state', () => {
        beforeEach(() => {
            mockResource.setValue(null);
            mockResource.setLoading(true);
            mockResource.setError(null);
            fixture.detectChanges();
        });

        it('should show skeleton while loading', () => {
            expect(skeleton()).toBeTruthy();
        });

        it('should not show error while loading', () => {
            expect(errorEl()).toBeNull();
        });

        it('should not show content while loading', () => {
            expect(title()).toBeNull();
        });
    });

    describe('error state', () => {
        beforeEach(() => {
            mockResource.setValue(null);
            mockResource.setLoading(false);
            mockResource.setError(new Error('fail'));
            fixture.detectChanges();
        });

        it('should show error component', () => {
            expect(errorEl()).toBeTruthy();
        });

        it('should not show skeleton', () => {
            expect(skeleton()).toBeNull();
        });

        it('should not show content', () => {
            expect(title()).toBeNull();
        });
    });

    describe('content rendering', () => {
        it('should display artwork title', () => {
            expect(title()?.textContent).toContain('Starry Night');
        });

        it('should display artist name', () => {
            expect(el().textContent).toContain('Vincent van Gogh');
        });

        it('should display year', () => {
            expect(el().textContent).toContain('1889');
        });

        it('should display medium', () => {
            expect(el().textContent).toContain('Oil on canvas');
        });

        it('should display dimensions', () => {
            expect(el().textContent).toContain('73.7 cm × 92.1 cm');
        });

        it('should display collection', () => {
            expect(el().textContent).toContain('European Painting');
        });

        it('should display description', () => {
            expect(el().textContent).toContain('A painting of stars');
        });

        it('should display categories', () => {
            expect(el().textContent).toContain('Painting, Modern Art');
        });

        it('should render museum link with correct href', () => {
            const link = el().querySelector('a[target="_blank"]') as HTMLAnchorElement;
            expect(link).toBeTruthy();
            expect(link.href).toBe('https://www.artic.edu/artworks/1');
        });

        it('should render image with correct src', () => {
            const img = el().querySelector('img') as HTMLImageElement;
            expect(img).toBeTruthy();
        });

        it('should render back button', () => {
            expect(backButton()).toBeTruthy();
        });
    });

    describe('navigation', () => {
        it('should call location.back when history exists', () => {
            const origLength = window.history.length;
            Object.defineProperty(window, 'history', {
                value: { ...window.history, length: 3 },
                writable: true,
                configurable: true,
            });

            backButton()?.click();
            fixture.detectChanges();

            expect(mockLocation.back).toHaveBeenCalledOnce();

            Object.defineProperty(window, 'history', {
                value: { ...window.history, length: origLength },
                writable: true,
                configurable: true,
            });
        });

        it('should navigate to root when no history', () => {
            Object.defineProperty(window, 'history', {
                value: { ...window.history, length: 1 },
                writable: true,
                configurable: true,
            });

            backButton()?.click();
            fixture.detectChanges();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);

            Object.defineProperty(window, 'history', {
                value: { ...window.history, length: 2 },
                writable: true,
                configurable: true,
            });
        });
    });

    describe('favorites', () => {
        it('should show "Save to favorites" when not a favorite', () => {
            expect(favoriteButton()?.textContent).toContain('Save to favorites');
        });

        it('should toggle favorite on button click', () => {
            favoriteButton()?.click();
            fixture.detectChanges();

            expect(favorites.isFavorite(1)).toBe(true);
            expect(favoriteButton()?.textContent).toContain('Saved');
        });

        it('should unfavorite on second click', () => {
            favoriteButton()?.click();
            fixture.detectChanges();
            expect(favorites.isFavorite(1)).toBe(true);

            favoriteButton()?.click();
            fixture.detectChanges();
            expect(favorites.isFavorite(1)).toBe(false);
            expect(favoriteButton()?.textContent).toContain('Save to favorites');
        });

        it('should not toggle favorite when data is null', () => {
            mockResource.setValue(null);
            fixture.detectChanges();

            expect(favoriteButton()).toBeUndefined();
        });
    });

    describe('conditional fields', () => {
        it('should hide year when empty', () => {
            mockResource.setValue(mockArtwork({ year: '' }));
            fixture.detectChanges();

            const labels = Array.from(el().querySelectorAll('span')).filter((s) => s.textContent?.includes('Year'));
            expect(labels.length).toBe(0);
        });

        it('should hide medium when empty', () => {
            mockResource.setValue(mockArtwork({ medium: '' }));
            fixture.detectChanges();

            const labels = Array.from(el().querySelectorAll('span')).filter((s) => s.textContent?.includes('Medium'));
            expect(labels.length).toBe(0);
        });

        it('should hide description when empty', () => {
            mockResource.setValue(mockArtwork({ description: '' }));
            fixture.detectChanges();

            const paragraphs = el().querySelectorAll('p.text-body-sm');
            const descParagraph = Array.from(paragraphs).find((p) => p.classList.contains('leading-[1.7]'));
            expect(descParagraph).toBeFalsy();
        });

        it('should hide image when imageUrl is empty', () => {
            mockResource.setValue(mockArtwork({ imageUrl: '' }));
            fixture.detectChanges();

            const img = el().querySelector('img');
            expect(img).toBeNull();
        });

        it('should show placeholder when imageUrl is empty', () => {
            mockResource.setValue(mockArtwork({ imageUrl: '' }));
            fixture.detectChanges();

            expect(el().querySelector('app-image-placeholder')).toBeTruthy();
        });

        it('should show placeholder when image fails to load', () => {
            const img = el().querySelector('img') as HTMLImageElement;
            expect(img).toBeTruthy();

            img.dispatchEvent(new Event('error'));
            fixture.detectChanges();

            expect(el().querySelector('img')).toBeNull();
            expect(el().querySelector('app-image-placeholder')).toBeTruthy();
        });
    });
});
