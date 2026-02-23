import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Favorites } from '../../shared/data/favorites';
import { ArtworkCard } from '../../shared/models/artwork-card';
import { GallerieListApi } from './data-access/gallerie-list-api';
import { GallerieListData } from './data-access/gallerie-list-data';
import { GallerieList } from './gallerie-list';

const mockArtwork = (overrides: Partial<ArtworkCard> = {}): ArtworkCard => ({
    id: 1,
    title: 'Starry Night',
    artist: 'Vincent van Gogh',
    subtitle: '1889 \u00b7 Oil on canvas',
    imageUrl: 'https://example.com/img.jpg',
    lqip: 'data:image/gif;base64,abc',
    categories: 'Painting, Modern Art',
    thumbnailWidth: 600,
    thumbnailHeight: 400,
    ...overrides,
});

function createMockListData() {
    const artworksSignal = signal<ArtworkCard[]>([]);
    const initialLoadingSignal = signal(true);
    const hasMoreSignal = signal(false);

    return {
        data: {
            artworks: artworksSignal.asReadonly(),
            initialLoading: initialLoadingSignal.asReadonly(),
            hasMore: hasMoreSignal.asReadonly(),
            nextPage: vi.fn(),
        },
        setArtworks: (val: ArtworkCard[]) => artworksSignal.set(val),
        setInitialLoading: (val: boolean) => initialLoadingSignal.set(val),
        setHasMore: (val: boolean) => hasMoreSignal.set(val),
    };
}

describe('GallerieList', () => {
    let fixture: ComponentFixture<GallerieList>;
    let favorites: Favorites;
    let mockRouter: { navigate: ReturnType<typeof vi.fn> };
    let mockListData: ReturnType<typeof createMockListData>;
    let intersectionCallback: IntersectionObserverCallback;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        mockListData = createMockListData();
        mockRouter = { navigate: vi.fn() };

        vi.stubGlobal(
            'IntersectionObserver',
            class {
                constructor(cb: IntersectionObserverCallback) {
                    intersectionCallback = cb;
                }
                observe = vi.fn();
                disconnect = vi.fn();
                unobserve = vi.fn();
            },
        );

        TestBed.overrideComponent(GallerieList, {
            set: {
                providers: [
                    { provide: GallerieListData, useValue: mockListData.data },
                    { provide: GallerieListApi, useValue: {} },
                ],
            },
        });

        await TestBed.configureTestingModule({
            imports: [GallerieList],
            providers: [{ provide: Router, useValue: mockRouter }],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        favorites = TestBed.inject(Favorites);
        fixture = TestBed.createComponent(GallerieList);
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const el = () => fixture.nativeElement as HTMLElement;
    const masonryGrid = () => el().querySelector('app-masonry-grid');
    const emptyState = () => el().querySelector('app-empty-state');
    const spinner = () => el().querySelector('.animate-spin');
    const artworkCards = () => el().querySelectorAll('app-masonry-grid-card');
    const cardElements = () => el().querySelectorAll('.card');
    const favoriteButtons = () => el().querySelectorAll<HTMLButtonElement>('button[aria-label="Toggle favorite"]');

    describe('loading state', () => {
        it('should show skeleton cards while loading', () => {
            expect(masonryGrid()).toBeTruthy();
            expect(artworkCards().length).toBe(8);
        });

        it('should not show empty state while loading', () => {
            expect(emptyState()).toBeNull();
        });

        it('should not show spinner while loading', () => {
            expect(spinner()).toBeNull();
        });
    });

    describe('empty state', () => {
        beforeEach(() => {
            mockListData.setInitialLoading(false);
            mockListData.setArtworks([]);
            fixture.detectChanges();
        });

        it('should show empty state when no artworks', () => {
            expect(emptyState()).toBeTruthy();
        });

        it('should display correct empty message', () => {
            expect(el().textContent).toContain('No artworks found');
        });

        it('should display subtitle hint', () => {
            expect(el().textContent).toContain('Try a different search term');
        });

        it('should not show masonry grid', () => {
            expect(masonryGrid()).toBeNull();
        });
    });

    describe('content rendering', () => {
        beforeEach(() => {
            mockListData.setInitialLoading(false);
            mockListData.setArtworks([mockArtwork(), mockArtwork({ id: 2, title: 'Water Lilies', artist: 'Claude Monet' })]);
            fixture.detectChanges();
        });

        it('should render artwork cards', () => {
            expect(artworkCards().length).toBe(2);
        });

        it('should display artwork title', () => {
            expect(el().textContent).toContain('Starry Night');
        });

        it('should display artist name', () => {
            expect(el().textContent).toContain('Vincent van Gogh');
        });

        it('should not show empty state', () => {
            expect(emptyState()).toBeNull();
        });
    });

    describe('infinite scroll', () => {
        beforeEach(() => {
            mockListData.setInitialLoading(false);
            mockListData.setArtworks([mockArtwork()]);
            mockListData.setHasMore(true);
            fixture.detectChanges();
        });

        it('should show spinner when hasMore is true', () => {
            expect(spinner()).toBeTruthy();
        });

        it('should not show spinner when hasMore is false', () => {
            mockListData.setHasMore(false);
            fixture.detectChanges();

            expect(spinner()).toBeNull();
        });

        it('should call nextPage when sentinel is intersecting', () => {
            intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);

            expect(mockListData.data.nextPage).toHaveBeenCalled();
        });

        it('should not call nextPage when sentinel is not intersecting', () => {
            intersectionCallback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);

            expect(mockListData.data.nextPage).not.toHaveBeenCalled();
        });
    });

    describe('navigation', () => {
        beforeEach(() => {
            mockListData.setInitialLoading(false);
            mockListData.setArtworks([mockArtwork()]);
            fixture.detectChanges();
        });

        it('should navigate to artwork on card click', () => {
            const card = cardElements()[0] as HTMLElement;
            card.click();
            fixture.detectChanges();

            expect(mockRouter.navigate).toHaveBeenCalledWith([1]);
        });
    });

    describe('favorites', () => {
        beforeEach(() => {
            mockListData.setInitialLoading(false);
            mockListData.setArtworks([mockArtwork()]);
            fixture.detectChanges();
        });

        it('should toggle favorite on button click', () => {
            const favBtn = favoriteButtons()[0];
            favBtn.click();
            fixture.detectChanges();

            expect(favorites.isFavorite(1)).toBe(true);
        });

        it('should unfavorite on second click', () => {
            const favBtn = favoriteButtons()[0];
            favBtn.click();
            fixture.detectChanges();
            expect(favorites.isFavorite(1)).toBe(true);

            favBtn.click();
            fixture.detectChanges();
            expect(favorites.isFavorite(1)).toBe(false);
        });

        it('should not navigate when clicking favorite button', () => {
            const favBtn = favoriteButtons()[0];
            favBtn.click();
            fixture.detectChanges();

            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });
    });
});
