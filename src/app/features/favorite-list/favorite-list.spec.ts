import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Favorites } from '../../shared/data/favorites';
import { ArtworkCard } from '../../shared/models/artwork-card';
import { FavoriteList } from './favorite-list';

if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    } as unknown as typeof ResizeObserver;
}

const mockCard = (id: number): ArtworkCard => ({
    id,
    title: `Art ${id}`,
    artist: `Artist ${id}`,
    subtitle: `Subtitle ${id}`,
    imageUrl: `https://img/${id}`,
    lqip: `data:image/gif;base64,lqip${id}`,
    categories: `Cat ${id}`,
    thumbnailWidth: 200 + id,
    thumbnailHeight: 300 + id,
});

describe('FavoriteList', () => {
    let fixture: ComponentFixture<FavoriteList>;
    let favorites: Favorites;
    let router: Router;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            imports: [FavoriteList],
            providers: [{ provide: Router, useValue: { navigate: vi.fn() } }],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        favorites = TestBed.inject(Favorites);
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(FavoriteList);
        fixture.detectChanges();
    });

    const cards = () => fixture.nativeElement.querySelectorAll('app-masonry-grid-card') as NodeListOf<HTMLElement>;
    const grid = () => fixture.nativeElement.querySelector('app-masonry-grid') as HTMLElement | null;
    const emptyState = () => fixture.nativeElement.querySelector('app-empty-state') as HTMLElement | null;

    function addItems(...ids: number[]): void {
        for (const id of ids) {
            favorites.upsert(mockCard(id));
        }
        fixture.detectChanges();
    }

    describe('empty state', () => {
        it('should show empty state when there are no favorites', () => {
            expect(emptyState()).toBeTruthy();
            expect(grid()).toBeNull();
        });

        it('should display correct empty message', () => {
            expect(emptyState()?.textContent).toContain('No favorite artworks found');
        });

        it('should hide empty state when favorites are added', () => {
            addItems(1);
            expect(emptyState()).toBeNull();
            expect(grid()).toBeTruthy();
        });
    });

    describe('grid rendering', () => {
        it('should render one card per favorite', () => {
            addItems(1, 2, 3);
            expect(cards().length).toBe(3);
        });

        it('should update card count when favorites change', () => {
            addItems(1, 2);
            expect(cards().length).toBe(2);

            addItems(3);
            expect(cards().length).toBe(3);
        });

        it('should remove card when favorite is toggled off', () => {
            addItems(1, 2, 3);
            expect(cards().length).toBe(3);

            favorites.upsert(mockCard(2));
            fixture.detectChanges();
            expect(cards().length).toBe(2);
        });

        it('should return to empty state when all favorites are removed', () => {
            addItems(1);
            expect(grid()).toBeTruthy();

            favorites.upsert(mockCard(1));
            fixture.detectChanges();
            expect(grid()).toBeNull();
            expect(emptyState()).toBeTruthy();
        });
    });

    describe('card content', () => {
        it('should render title text inside card', () => {
            addItems(5);
            expect(cards()[0].textContent).toContain('Art 5');
        });

        it('should render artist text inside card', () => {
            addItems(5);
            expect(cards()[0].textContent).toContain('Artist 5');
        });

        it('should render subtitle text inside card', () => {
            addItems(5);
            expect(cards()[0].textContent).toContain('Subtitle 5');
        });

        it('should render distinct content per card', () => {
            addItems(1, 2);
            const [first, second] = Array.from(cards());
            expect(first.textContent).toContain('Art 1');
            expect(second.textContent).toContain('Art 2');
            expect(first.textContent).not.toContain('Art 2');
        });
    });

    describe('navigation', () => {
        it('should navigate to artwork id on card click', () => {
            addItems(42);

            const card = cards()[0];
            card.dispatchEvent(new CustomEvent('cardClick', { bubbles: true }));
            fixture.detectChanges();

            expect(router.navigate).toHaveBeenCalledWith([42]);
        });

        it('should navigate to correct id when clicking different cards', () => {
            addItems(10, 20, 30);

            cards()[1].dispatchEvent(new CustomEvent('cardClick', { bubbles: true }));
            fixture.detectChanges();

            expect(router.navigate).toHaveBeenCalledWith([20]);
        });

        it('should not navigate without card click', () => {
            addItems(1);
            expect(router.navigate).not.toHaveBeenCalled();
        });
    });
});
