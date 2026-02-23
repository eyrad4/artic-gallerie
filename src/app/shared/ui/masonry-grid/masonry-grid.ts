import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';

const BREAKPOINTS: [number, number][] = [
    [1024, 4],
    [768, 3],
    [640, 2],
    [0, 1],
];

const GAP = 20;

@Component({
    selector: 'app-masonry-grid',
    template: `
        <div #container class="relative" [style.height.px]="_containerHeight()">
            <ng-content />
        </div>
    `,
    styles: `
        :host {
            display: block;
        }
    `,
})
export class MasonryGrid {
    private readonly _container = viewChild.required<ElementRef<HTMLElement>>('container');
    private readonly _destroyRef = inject(DestroyRef);

    protected readonly _containerHeight = signal(0);

    private _rafId: number | null = null;
    private _prevWidth = 0;

    constructor() {
        afterNextRender(() => {
            const el = this._container().nativeElement;

            const resizeObserver = new ResizeObserver(([entry]) => {
                const width = entry.contentRect.width;
                if (width !== this._prevWidth) {
                    this._prevWidth = width;
                    this._scheduleLayout();
                }
            });
            resizeObserver.observe(el);

            const mutationObserver = new MutationObserver(() => this._scheduleLayout());
            mutationObserver.observe(el, { childList: true });

            this._destroyRef.onDestroy(() => {
                resizeObserver.disconnect();
                mutationObserver.disconnect();
                if (this._rafId !== null) {
                    cancelAnimationFrame(this._rafId);
                }
            });

            this._scheduleLayout();
        });
    }

    private _scheduleLayout(): void {
        if (this._rafId !== null) return;
        this._rafId = requestAnimationFrame(() => {
            this._rafId = null;
            this._performLayout();
        });
    }

    private _performLayout(): void {
        const container = this._container().nativeElement;
        const cards = this._getCards(container);

        if (cards.length === 0) {
            this._containerHeight.set(0);
            return;
        }

        const cols = this._getColumnCount(container.offsetWidth);
        const colWidth = (container.offsetWidth - GAP * (cols - 1)) / cols;
        const heights = this._measureHeights(container, cards, colWidth);
        this._positionCards(cards, cols, colWidth, heights);
    }

    private _getCards(container: HTMLElement): HTMLElement[] {
        return Array.from(container.children).filter((el): el is HTMLElement => el instanceof HTMLElement);
    }

    private _measureHeights(container: HTMLElement, cards: HTMLElement[], colWidth: number): number[] {
        for (const card of cards) {
            card.style.width = `${colWidth}px`;
        }
        void container.offsetHeight;
        return cards.map((card) => card.offsetHeight);
    }

    private _positionCards(cards: HTMLElement[], cols: number, colWidth: number, heights: number[]): void {
        const colHeights = new Array(cols).fill(0);

        for (let i = 0; i < cards.length; i++) {
            const shortestCol = colHeights.indexOf(Math.min(...colHeights));
            cards[i].style.transform = `translate(${shortestCol * (colWidth + GAP)}px, ${colHeights[shortestCol]}px)`;
            colHeights[shortestCol] += heights[i] + GAP;
        }

        const maxHeight = Math.max(...colHeights);
        this._containerHeight.set(maxHeight > 0 ? maxHeight - GAP : 0);
    }

    private _getColumnCount(width: number): number {
        for (const [breakpoint, cols] of BREAKPOINTS) {
            if (width >= breakpoint) return cols;
        }
        return 1;
    }
}
