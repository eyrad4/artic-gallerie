import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WINDOW } from '../common/web-apis/window';
import { Layout } from './layout';

describe('Layout', () => {
    let fixture: ComponentFixture<Layout>;
    let mockWindow: { scrollY: number };
    let resizeCallback: ResizeObserverCallback;
    let disconnectCalls: number;
    let observedElements: Element[];

    function stubResizeObserver(): void {
        disconnectCalls = 0;
        observedElements = [];

        vi.stubGlobal(
            'ResizeObserver',
            class {
                constructor(cb: ResizeObserverCallback) {
                    resizeCallback = cb;
                }
                observe(el: Element) {
                    observedElements.push(el);
                }
                unobserve() {}
                disconnect() {
                    disconnectCalls++;
                }
            },
        );
    }

    beforeEach(async () => {
        TestBed.resetTestingModule();
        stubResizeObserver();

        mockWindow = { scrollY: 0 };

        await TestBed.configureTestingModule({
            imports: [Layout],
            providers: [provideRouter([]), { provide: WINDOW, useFactory: () => mockWindow }],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        fixture = TestBed.createComponent(Layout);
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const headerEl = () => fixture.nativeElement.querySelector('header') as HTMLElement;
    const mainEl = () => fixture.nativeElement.querySelector('main') as HTMLElement;

    function triggerScroll(scrollY: number): void {
        mockWindow.scrollY = scrollY;
        window.dispatchEvent(new Event('scroll'));
        fixture.detectChanges();
    }

    function simulateResize(height: number): void {
        resizeCallback([{ contentRect: { height } } as ResizeObserverEntry], {} as ResizeObserver);
        fixture.detectChanges();
    }

    describe('structure', () => {
        it('should render header, main and footer elements', () => {
            const el = fixture.nativeElement as HTMLElement;
            expect(el.querySelector('header')).toBeTruthy();
            expect(el.querySelector('main')).toBeTruthy();
            expect(el.querySelector('footer')).toBeTruthy();
        });

        it('should render named router-outlets in header', () => {
            const outlets = headerEl().querySelectorAll('router-outlet');
            const names = Array.from(outlets).map((o) => o.getAttribute('name'));
            expect(names).toContain('headerSearch');
            expect(names).toContain('headerActions');
        });

        it('should render router-outlet inside main', () => {
            expect(mainEl().querySelector('router-outlet')).toBeTruthy();
        });
    });

    describe('scroll shadow', () => {
        it('should not have shadow initially', () => {
            expect(headerEl().classList.contains('shadow-md')).toBe(false);
        });

        it('should NOT apply shadow at scrollY = 10 (boundary: uses >, not >=)', () => {
            triggerScroll(10);
            expect(headerEl().classList.contains('shadow-md')).toBe(false);
        });

        it('should apply shadow at scrollY = 11', () => {
            triggerScroll(11);
            expect(headerEl().classList.contains('shadow-md')).toBe(true);
        });

        it('should apply shadow at very large scroll values', () => {
            triggerScroll(100_000);
            expect(headerEl().classList.contains('shadow-md')).toBe(true);
        });

        it('should remove shadow when scrolling back to 0', () => {
            triggerScroll(100);
            expect(headerEl().classList.contains('shadow-md')).toBe(true);

            triggerScroll(0);
            expect(headerEl().classList.contains('shadow-md')).toBe(false);
        });

        it('should remove shadow when scrolling below threshold after being scrolled', () => {
            triggerScroll(50);
            triggerScroll(5);
            expect(headerEl().classList.contains('shadow-md')).toBe(false);
        });

        it('should toggle correctly across rapid scroll oscillation', () => {
            const cases: [scrollY: number, shadow: boolean][] = [
                [0, false],
                [10, false],
                [11, true],
                [50, true],
                [10, false],
                [0, false],
                [11, true],
                [100, true],
                [9, false],
            ];

            for (const [scrollY, expectedShadow] of cases) {
                triggerScroll(scrollY);
                expect(headerEl().classList.contains('shadow-md')).toBe(expectedShadow);
            }
        });
    });

    describe('dynamic padding-top', () => {
        it('should default to 104px before ResizeObserver fires (72 + 32)', () => {
            expect(mainEl().style.paddingTop).toBe('104px');
        });

        it('should update when header height changes', () => {
            simulateResize(100);
            expect(mainEl().style.paddingTop).toBe('132px');
        });

        it('should handle header height = 0 (collapsed header)', () => {
            simulateResize(0);
            expect(mainEl().style.paddingTop).toBe('32px');
        });

        it('should handle tall header (e.g. mobile multi-row wrap)', () => {
            simulateResize(200);
            expect(mainEl().style.paddingTop).toBe('232px');
        });

        it('should handle fractional pixel heights', () => {
            simulateResize(72.5);
            expect(mainEl().style.paddingTop).toBe('104.5px');
        });

        it('should always reflect the latest height after multiple resizes', () => {
            simulateResize(50);
            expect(mainEl().style.paddingTop).toBe('82px');

            simulateResize(120);
            expect(mainEl().style.paddingTop).toBe('152px');

            simulateResize(72);
            expect(mainEl().style.paddingTop).toBe('104px');
        });
    });

    describe('ResizeObserver lifecycle', () => {
        it('should observe the header element after render', () => {
            expect(observedElements).toHaveLength(1);
            expect(observedElements[0].tagName).toBe('HEADER');
        });

        it('should disconnect observer on component destroy', () => {
            expect(disconnectCalls).toBe(0);
            fixture.destroy();
            expect(disconnectCalls).toBe(1);
        });

        it('should not disconnect while component is alive', () => {
            simulateResize(100);
            triggerScroll(50);
            expect(disconnectCalls).toBe(0);
        });
    });
});
