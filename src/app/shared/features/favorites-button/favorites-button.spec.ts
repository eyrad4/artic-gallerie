import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritesButton } from './favorites-button';

describe('FavoritesButton', () => {
    let fixture: ComponentFixture<FavoritesButton>;
    let component: FavoritesButton;

    beforeEach(async () => {
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            imports: [FavoritesButton],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        fixture = TestBed.createComponent(FavoritesButton);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const buttonEl = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const badgeEl = () => fixture.nativeElement.querySelector('span') as HTMLSpanElement | null;

    function click(): void {
        buttonEl().click();
        fixture.detectChanges();
    }

    describe('toggle state consistency', () => {
        it('should start inactive', () => {
            expect(buttonEl().classList.contains('border-terracotta-500')).toBe(false);
            expect(buttonEl().classList.contains('text-terracotta-500')).toBe(false);
        });

        it('should become active after one click', () => {
            click();
            expect(buttonEl().classList.contains('border-terracotta-500')).toBe(true);
            expect(buttonEl().classList.contains('text-terracotta-500')).toBe(true);
        });

        it('should deactivate after two clicks (toggle back)', () => {
            click();
            click();
            expect(buttonEl().classList.contains('border-terracotta-500')).toBe(false);
            expect(buttonEl().classList.contains('text-terracotta-500')).toBe(false);
        });

        it('should keep border and text classes in sync — never one without the other', () => {
            for (let i = 0; i < 20; i++) {
                click();
                const hasBorder = buttonEl().classList.contains('border-terracotta-500');
                const hasText = buttonEl().classList.contains('text-terracotta-500');
                expect(hasBorder).toBe(hasText);
            }
        });
    });

    describe('rapid double-click does not desync', () => {
        it('should handle rapid even number of clicks — returns to inactive', () => {
            for (let i = 0; i < 6; i++) {
                click();
            }
            expect(buttonEl().classList.contains('border-terracotta-500')).toBe(false);
        });

        it('should handle rapid odd number of clicks — ends active', () => {
            for (let i = 0; i < 7; i++) {
                click();
            }
            expect(buttonEl().classList.contains('border-terracotta-500')).toBe(true);
        });
    });

    describe('badge visibility boundary', () => {
        it('should not render badge when count is 0', () => {
            expect(badgeEl()).toBeNull();
        });

        it('should render badge when count becomes 1', () => {
            component['_count'].set(1);
            fixture.detectChanges();
            expect(badgeEl()).toBeTruthy();
            expect(badgeEl()!.textContent!.trim()).toBe('1');
        });

        it('should hide badge when count returns to 0 from positive', () => {
            component['_count'].set(5);
            fixture.detectChanges();
            expect(badgeEl()).toBeTruthy();

            component['_count'].set(0);
            fixture.detectChanges();
            expect(badgeEl()).toBeNull();
        });

        it('should not render badge for negative count (defensive)', () => {
            component['_count'].set(-1);
            fixture.detectChanges();
            expect(badgeEl()).toBeNull();
        });
    });

    describe('badge displays correct count', () => {
        it('should show exact count for large numbers', () => {
            component['_count'].set(999);
            fixture.detectChanges();
            expect(badgeEl()!.textContent!.trim()).toBe('999');
        });

        it('should update badge text reactively when count changes', () => {
            component['_count'].set(3);
            fixture.detectChanges();
            expect(badgeEl()!.textContent!.trim()).toBe('3');

            component['_count'].set(7);
            fixture.detectChanges();
            expect(badgeEl()!.textContent!.trim()).toBe('7');
        });
    });

    describe('active state and badge are independent', () => {
        it('should allow active=true with count=0 (no badge but highlighted)', () => {
            click();
            expect(buttonEl().classList.contains('border-terracotta-500')).toBe(true);
            expect(badgeEl()).toBeNull();
        });

        it('should allow active=false with count>0 (badge but not highlighted)', () => {
            component['_count'].set(3);
            fixture.detectChanges();
            expect(buttonEl().classList.contains('border-terracotta-500')).toBe(false);
            expect(badgeEl()).toBeTruthy();
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
