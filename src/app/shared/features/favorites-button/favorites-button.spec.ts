import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Favorites } from '../../data/favorites';
import { ArtworkCard } from '../../models/artwork-card';
import { FavoritesButton } from './favorites-button';

const mockCard = (id: number): ArtworkCard => ({
    id,
    title: `Art ${id}`,
    artist: 'Artist',
    subtitle: '',
    imageUrl: '',
    lqip: undefined,
    categories: '',
    thumbnailWidth: undefined,
    thumbnailHeight: undefined,
});

describe('FavoritesButton', () => {
    let fixture: ComponentFixture<FavoritesButton>;
    let favorites: Favorites;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            imports: [FavoritesButton],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        favorites = TestBed.inject(Favorites);
        fixture = TestBed.createComponent(FavoritesButton);
        fixture.detectChanges();
    });

    const buttonEl = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const badgeEl = () => fixture.nativeElement.querySelector('span') as HTMLSpanElement | null;

    function click(): void {
        buttonEl().click();
        fixture.detectChanges();
    }

    function addItems(count: number): void {
        for (let i = 0; i < count; i++) {
            favorites.upsert(mockCard(i + 1));
        }
        fixture.detectChanges();
    }

    function clearAll(count: number): void {
        for (let i = 0; i < count; i++) {
            favorites.upsert(mockCard(i + 1));
        }
        fixture.detectChanges();
    }

    describe('toggle state consistency', () => {
        it('should start inactive', () => {
            expect(buttonEl().classList.contains('border-terracotta-500')).toBe(false);
            expect(buttonEl().classList.contains('text-terracotta-500')).toBe(false);
        });

        it('should keep border and text classes in sync — never one without the other', () => {
            addItems(1);
            for (let i = 0; i < 20; i++) {
                click();
                const hasBorder = buttonEl().classList.contains('border-terracotta-500');
                const hasText = buttonEl().classList.contains('text-terracotta-500');
                expect(hasBorder).toBe(hasText);
            }
        });
    });

    describe('badge visibility boundary', () => {
        it('should not render badge when count is 0', () => {
            expect(badgeEl()).toBeNull();
        });

        it('should render badge when count becomes 1', () => {
            addItems(1);
            expect(badgeEl()).toBeTruthy();
            expect(badgeEl()!.textContent!.trim()).toBe('1');
        });

        it('should hide badge when count returns to 0 from positive', () => {
            addItems(5);
            expect(badgeEl()).toBeTruthy();

            clearAll(5);
            expect(badgeEl()).toBeNull();
        });
    });

    describe('badge displays correct count', () => {
        it('should show correct count for multiple items', () => {
            addItems(3);
            expect(badgeEl()!.textContent!.trim()).toBe('3');
        });

        it('should update badge text reactively when count changes', () => {
            addItems(3);
            expect(badgeEl()!.textContent!.trim()).toBe('3');

            favorites.upsert(mockCard(10));
            favorites.upsert(mockCard(11));
            fixture.detectChanges();
            expect(badgeEl()!.textContent!.trim()).toBe('5');
        });
    });

    describe('active state and badge are independent', () => {
        it('should show no badge when count is 0', () => {
            expect(badgeEl()).toBeNull();
        });

        it('should show badge when items exist', () => {
            addItems(3);
            expect(buttonEl().classList.contains('border-terracotta-500')).toBe(false);
            expect(badgeEl()).toBeTruthy();
        });
    });

    describe('disabled state', () => {
        it('should be disabled when there are no favorites', () => {
            expect(buttonEl().disabled).toBe(true);
        });

        it('should be enabled when there are favorites', () => {
            addItems(1);
            expect(buttonEl().disabled).toBe(false);
        });
    });

    describe('accessibility', () => {
        it('should have title attribute for tooltip', () => {
            expect(buttonEl().title).toBe('View favorites');
        });

        it('should be a real button element (keyboard accessible)', () => {
            expect(buttonEl().tagName).toBe('BUTTON');
        });
    });
});
