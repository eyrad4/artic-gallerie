import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasonryGrid } from './masonry-grid';

@Component({
    selector: 'app-test-host',
    imports: [MasonryGrid],
    template: `
        <app-masonry-grid>
            @for (card of cards; track card.id) {
                <div class="card"></div>
            }
        </app-masonry-grid>
    `,
})
class TestHost {
    cards: { id: number; mockHeight: number }[] = [];
}

describe('MasonryGrid', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;
    let resizeCallback: ResizeObserverCallback;
    let mutationCallback: MutationCallback;
    let resizeDisconnectCalls: number;
    let mutationDisconnectCalls: number;
    let rafCallbacks: FrameRequestCallback[];

    function stubBrowserApis(): void {
        resizeDisconnectCalls = 0;
        mutationDisconnectCalls = 0;
        rafCallbacks = [];

        vi.stubGlobal(
            'ResizeObserver',
            class {
                constructor(cb: ResizeObserverCallback) {
                    resizeCallback = cb;
                }
                observe() {}
                unobserve() {}
                disconnect() {
                    resizeDisconnectCalls++;
                }
            },
        );

        vi.stubGlobal(
            'MutationObserver',
            class {
                constructor(cb: MutationCallback) {
                    mutationCallback = cb;
                }
                observe() {}
                disconnect() {
                    mutationDisconnectCalls++;
                }
            },
        );

        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
            rafCallbacks.push(cb);
            return rafCallbacks.length;
        });

        vi.stubGlobal('cancelAnimationFrame', vi.fn());
    }

    function flushRaf(): void {
        const cbs = rafCallbacks.splice(0);
        for (const cb of cbs) cb(performance.now());
    }

    function containerEl(): HTMLElement {
        return fixture.nativeElement.querySelector('.relative') as HTMLElement;
    }

    function cardEls(): HTMLElement[] {
        return Array.from(containerEl().querySelectorAll('.card'));
    }

    function mockContainerWidth(width: number): void {
        Object.defineProperty(containerEl(), 'offsetWidth', { get: () => width, configurable: true });
    }

    function mockCardHeights(): void {
        const cards = cardEls();
        for (let i = 0; i < cards.length; i++) {
            const h = host.cards[i]?.mockHeight ?? 0;
            Object.defineProperty(cards[i], 'offsetHeight', { get: () => h, configurable: true });
        }
    }

    /**
     * Renders cards, mocks dimensions, runs one layout pass, and stabilizes.
     * Must be called after setting `host.cards`.
     */
    function renderAndLayout(containerWidth: number): void {
        mockContainerWidth(containerWidth);
        fixture.detectChanges(); // renders cards, afterNextRender fires (queues rAF)
        mockCardHeights(); // mock heights on now-existing DOM nodes
        flushRaf(); // runs _performLayout, sets _containerHeight signal
        fixture.detectChanges(); // apply signal change to template
    }

    beforeEach(async () => {
        TestBed.resetTestingModule();
        stubBrowserApis();

        await TestBed.configureTestingModule({
            imports: [TestHost],
            teardown: { destroyAfterEach: true },
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        // NOTE: do NOT call detectChanges here — each test sets cards first
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('column count breakpoints', () => {
        it('should use 1 column when width < 640', () => {
            host.cards = [
                { id: 1, mockHeight: 100 },
                { id: 2, mockHeight: 100 },
            ];
            renderAndLayout(500);

            for (const card of cardEls()) {
                expect(card.style.transform).toContain('translate(0px');
            }
        });

        it('should use 2 columns when width >= 640 and < 768', () => {
            host.cards = [
                { id: 1, mockHeight: 100 },
                { id: 2, mockHeight: 100 },
            ];
            renderAndLayout(640);

            const transforms = cardEls().map((c) => c.style.transform);
            expect(transforms[0]).toContain('translate(0px');
            expect(transforms[1]).not.toContain('translate(0px');
        });

        it('should use 3 columns when width >= 768 and < 1024', () => {
            host.cards = [
                { id: 1, mockHeight: 50 },
                { id: 2, mockHeight: 50 },
                { id: 3, mockHeight: 50 },
            ];
            renderAndLayout(800);

            const xPositions = cardEls().map((c) => parseFloat(c.style.transform.match(/translate\(([^,]+)px/)?.[1] ?? '0'));
            expect(new Set(xPositions).size).toBe(3);
        });

        it('should use 4 columns when width >= 1024', () => {
            host.cards = [
                { id: 1, mockHeight: 50 },
                { id: 2, mockHeight: 50 },
                { id: 3, mockHeight: 50 },
                { id: 4, mockHeight: 50 },
            ];
            renderAndLayout(1200);

            const xPositions = cardEls().map((c) => parseFloat(c.style.transform.match(/translate\(([^,]+)px/)?.[1] ?? '0'));
            expect(new Set(xPositions).size).toBe(4);
        });

        it('should use exact breakpoint boundary — 1024 gives 4 columns', () => {
            host.cards = Array.from({ length: 4 }, (_, i) => ({ id: i + 1, mockHeight: 50 }));
            renderAndLayout(1024);

            const xPositions = cardEls().map((c) => parseFloat(c.style.transform.match(/translate\(([^,]+)px/)?.[1] ?? '0'));
            expect(new Set(xPositions).size).toBe(4);
        });

        it('should use exact breakpoint boundary — 768 gives 3 columns', () => {
            host.cards = Array.from({ length: 3 }, (_, i) => ({ id: i + 1, mockHeight: 50 }));
            renderAndLayout(768);

            const xPositions = cardEls().map((c) => parseFloat(c.style.transform.match(/translate\(([^,]+)px/)?.[1] ?? '0'));
            expect(new Set(xPositions).size).toBe(3);
        });
    });

    describe('card positioning', () => {
        it('should place cards in shortest column', () => {
            host.cards = [
                { id: 1, mockHeight: 200 },
                { id: 2, mockHeight: 100 },
                { id: 3, mockHeight: 50 },
            ];
            renderAndLayout(640);

            // 2 columns: card1 → col0, card2 → col1, card3 → col1 (shorter: 100+20 = 120 < 200)
            const cards = cardEls();
            const yOf = (el: HTMLElement) => parseFloat(el.style.transform.match(/,\s*([^)]+)px/)?.[1] ?? '0');

            expect(yOf(cards[0])).toBe(0);
            expect(yOf(cards[1])).toBe(0);
            expect(yOf(cards[2])).toBe(120);
        });

        it('should set container height to tallest column minus gap', () => {
            host.cards = [
                { id: 1, mockHeight: 200 },
                { id: 2, mockHeight: 100 },
            ];
            renderAndLayout(640);

            // colHeights: col0 = 200+20 = 220, col1 = 100+20 = 120 → max = 220 → 220-20 = 200
            expect(containerEl().style.height).toBe('200px');
        });

        it('should set container height to 0 when there are no cards', () => {
            host.cards = [];
            renderAndLayout(640);

            expect(containerEl().style.height).toBe('0px');
        });

        it('should distribute equal-height cards evenly across columns', () => {
            host.cards = Array.from({ length: 4 }, (_, i) => ({ id: i + 1, mockHeight: 100 }));
            renderAndLayout(640);

            // 2 columns, equal heights: card1→col0, card2→col1, card3→col0, card4→col1
            const cards = cardEls();
            const xOf = (el: HTMLElement) => parseFloat(el.style.transform.match(/translate\(([^,]+)px/)?.[1] ?? '0');

            expect(xOf(cards[0])).toBe(0);
            expect(xOf(cards[2])).toBe(0);
            expect(xOf(cards[1])).toBe(xOf(cards[3]));
            expect(xOf(cards[1])).toBeGreaterThan(0);
        });
    });

    describe('layout scheduling', () => {
        it('should coalesce multiple resize events into one rAF', () => {
            host.cards = [{ id: 1, mockHeight: 100 }];
            renderAndLayout(500);

            const before = rafCallbacks.length;

            // Two quick resizes — only one rAF should be queued
            resizeCallback([{ contentRect: { width: 600 } } as ResizeObserverEntry], {} as ResizeObserver);
            resizeCallback([{ contentRect: { width: 700 } } as ResizeObserverEntry], {} as ResizeObserver);

            expect(rafCallbacks.length - before).toBe(1);
        });

        it('should skip layout when width does not change', () => {
            host.cards = [{ id: 1, mockHeight: 100 }];
            renderAndLayout(500);

            // Set _prevWidth by firing a resize callback and running it
            resizeCallback([{ contentRect: { width: 500 } } as ResizeObserverEntry], {} as ResizeObserver);
            flushRaf();
            fixture.detectChanges();

            const before = rafCallbacks.length;
            resizeCallback([{ contentRect: { width: 500 } } as ResizeObserverEntry], {} as ResizeObserver);
            expect(rafCallbacks.length - before).toBe(0);
        });
    });

    describe('mutation observer', () => {
        it('should re-layout when children change', () => {
            host.cards = [{ id: 1, mockHeight: 100 }];
            renderAndLayout(640);

            expect(cardEls().length).toBe(1);
            expect(cardEls()[0].style.transform).toBeTruthy();

            // Add another card
            host.cards = [
                { id: 1, mockHeight: 100 },
                { id: 2, mockHeight: 150 },
            ];
            fixture.detectChanges();
            mockCardHeights();

            // Simulate MutationObserver firing for childList change
            mutationCallback([], {} as MutationObserver);
            flushRaf();
            fixture.detectChanges();

            expect(cardEls().length).toBe(2);
            // Both cards should be positioned in separate columns
            for (const card of cardEls()) {
                expect(card.style.width).toBeTruthy();
            }
        });
    });

    describe('observer lifecycle', () => {
        it('should disconnect both observers on destroy', () => {
            host.cards = [];
            renderAndLayout(640);

            expect(resizeDisconnectCalls).toBe(0);
            expect(mutationDisconnectCalls).toBe(0);

            fixture.destroy();

            expect(resizeDisconnectCalls).toBe(1);
            expect(mutationDisconnectCalls).toBe(1);
        });

        it('should cancel pending rAF on destroy', () => {
            host.cards = [{ id: 1, mockHeight: 100 }];
            renderAndLayout(640);

            const before = rafCallbacks.length;

            // Trigger a resize without flushing — queues a pending rAF
            resizeCallback([{ contentRect: { width: 800 } } as ResizeObserverEntry], {} as ResizeObserver);
            expect(rafCallbacks.length - before).toBe(1);

            fixture.destroy();

            expect(cancelAnimationFrame).toHaveBeenCalled();
        });
    });

    describe('card width assignment', () => {
        it('should set correct card width based on column count and gap', () => {
            host.cards = [{ id: 1, mockHeight: 100 }];
            renderAndLayout(640);

            // 2 cols: colWidth = (640 - 20 * 1) / 2 = 310
            expect(cardEls()[0].style.width).toBe('310px');
        });

        it('should set full width for single column', () => {
            host.cards = [{ id: 1, mockHeight: 100 }];
            renderAndLayout(500);

            // 1 col: colWidth = (500 - 0) / 1 = 500
            expect(cardEls()[0].style.width).toBe('500px');
        });
    });
});
