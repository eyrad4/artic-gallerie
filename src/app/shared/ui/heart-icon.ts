import { Component, input } from '@angular/core';

@Component({
    selector: 'app-heart-icon',
    host: {
        class: 'inline-block',
    },
    template: `
        <svg
            class="size-full"
            viewBox="0 0 24 24"
            [attr.fill]="filled() ? fillColor() : 'none'"
            [attr.stroke]="filled() ? fillColor() : 'currentColor'"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
    `,
})
export class HeartIcon {
    readonly filled = input(false);

    readonly fillColor = input('currentColor');
}
