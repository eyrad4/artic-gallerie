import { Component, input } from '@angular/core';

@Component({
    selector: 'app-skeleton',
    host: {
        class: 'block shimmer animate-shimmer',
        '[class.rounded-full]': 'circle()',
        '[class.rounded]': '!circle()',
        '[style.width]': 'width()',
        '[style.height]': 'height()',
        '[style.aspect-ratio]': 'aspectRatio()',
    },
    template: '',
})
export class Skeleton {
    readonly width = input<string>();

    readonly height = input<string>();

    readonly aspectRatio = input<string>();

    readonly circle = input(false);
}
