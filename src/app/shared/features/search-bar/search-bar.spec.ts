import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBar } from './search-bar';

describe('SearchBar', () => {
    let fixture: ComponentFixture<SearchBar>;

    beforeEach(async () => {
        vi.useFakeTimers();
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            imports: [SearchBar],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        fixture = TestBed.createComponent(SearchBar);
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const inputEl = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const spinnerEl = () => fixture.nativeElement.querySelector('div[class*="animate-spin"]') as HTMLElement;
    const isSpinnerVisible = () => !spinnerEl().classList.contains('opacity-0');

    function typeChar(): void {
        inputEl().dispatchEvent(new Event('input'));
        fixture.detectChanges();
    }

    describe('loading state leaks', () => {
        it('should not show spinner initially', () => {
            expect(isSpinnerVisible()).toBe(false);
        });

        it('should show spinner immediately on input', () => {
            typeChar();
            expect(isSpinnerVisible()).toBe(true);
        });

        it('should hide spinner after debounce completes', () => {
            typeChar();
            vi.advanceTimersByTime(500);
            fixture.detectChanges();
            expect(isSpinnerVisible()).toBe(false);
        });

        it('should NOT hide spinner before debounce completes (499ms)', () => {
            typeChar();
            vi.advanceTimersByTime(499);
            fixture.detectChanges();
            expect(isSpinnerVisible()).toBe(true);
        });

        it('should not fire stale timer callback after component destroy', () => {
            typeChar();
            expect(isSpinnerVisible()).toBe(true);

            fixture.destroy();
            // the pending 500ms callback should not throw on a destroyed component
            expect(() => vi.advanceTimersByTime(500)).not.toThrow();
        });
    });

    describe('debounce timer accumulation', () => {
        it('should reset debounce on each keystroke — only one timer active', () => {
            typeChar();
            vi.advanceTimersByTime(400);
            fixture.detectChanges();
            expect(isSpinnerVisible()).toBe(true);

            // second keystroke at 400ms — debounce should restart
            typeChar();
            vi.advanceTimersByTime(400);
            fixture.detectChanges();
            // 400ms after second keystroke: total 800ms, spinner should still be visible
            expect(isSpinnerVisible()).toBe(true);

            // 100ms more after second keystroke → total 500ms from last input
            vi.advanceTimersByTime(100);
            fixture.detectChanges();
            expect(isSpinnerVisible()).toBe(false);
        });

        it('should not fire multiple callbacks from rapid sequential inputs', () => {
            const transitionsToHidden = 0;

            for (let i = 0; i < 10; i++) {
                typeChar();
                vi.advanceTimersByTime(100);
                fixture.detectChanges();
            }

            // after the rapid typing, spinner should still be loading
            expect(isSpinnerVisible()).toBe(true);

            // now let the final debounce resolve
            vi.advanceTimersByTime(500);
            fixture.detectChanges();

            // spinner hides exactly once
            expect(isSpinnerVisible()).toBe(false);
        });
    });

    describe('spinner flicker on continuous typing', () => {
        it('should keep spinner visible during continuous typing without flicker', () => {
            // simulate typing one char every 200ms for 2 seconds
            for (let i = 0; i < 10; i++) {
                typeChar();
                vi.advanceTimersByTime(200);
                fixture.detectChanges();
                // spinner must NEVER disappear during continuous typing
                expect(isSpinnerVisible()).toBe(true);
            }
        });

        it('should hide spinner only after a full 500ms pause', () => {
            typeChar();
            vi.advanceTimersByTime(200);
            typeChar();
            vi.advanceTimersByTime(200);
            typeChar();

            // 499ms from last keystroke
            vi.advanceTimersByTime(499);
            fixture.detectChanges();
            expect(isSpinnerVisible()).toBe(true);

            // 1ms more — debounce fires
            vi.advanceTimersByTime(1);
            fixture.detectChanges();
            expect(isSpinnerVisible()).toBe(false);
        });
    });

    describe('re-activation after idle', () => {
        it('should re-show spinner when typing resumes after debounce completed', () => {
            typeChar();
            vi.advanceTimersByTime(500);
            fixture.detectChanges();
            expect(isSpinnerVisible()).toBe(false);

            // start typing again
            typeChar();
            expect(isSpinnerVisible()).toBe(true);

            vi.advanceTimersByTime(500);
            fixture.detectChanges();
            expect(isSpinnerVisible()).toBe(false);
        });
    });
});
