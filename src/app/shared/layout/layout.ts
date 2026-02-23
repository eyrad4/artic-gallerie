import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { WINDOW } from '../common/web-apis/window';

@Component({
    selector: 'app-layout',
    imports: [RouterLink, RouterOutlet],
    templateUrl: './layout.html',
    styles: [
        `
            :host {
                display: block;
            }
        `,
    ],
})
export class Layout {
    private readonly _window = inject(WINDOW);

    private readonly _destroyRef = inject(DestroyRef);

    private readonly _headerEl = viewChild.required<ElementRef<HTMLElement>>('header');

    private readonly _headerHeight = signal(72);

    protected readonly _scrolled = signal(false);

    protected readonly _mainPaddingTop = computed(() => `${this._headerHeight() + 32}px`);

    constructor() {
        afterNextRender(() => {
            const el = this._headerEl().nativeElement;
            const observer = new ResizeObserver(([entry]) => {
                this._headerHeight.set(entry.contentRect.height);
            });

            observer.observe(el);
            this._destroyRef.onDestroy(() => observer.disconnect());
        });
    }

    protected _windowScrolling(): void {
        this._scrolled.set(this._window.scrollY > 10);
    }
}
