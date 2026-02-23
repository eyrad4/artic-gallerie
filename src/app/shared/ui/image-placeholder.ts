import { Component } from '@angular/core';

@Component({
    selector: 'app-image-placeholder',
    host: {
        class: 'flex items-center justify-center size-full bg-gray-50',
    },
    template: `
        <div class="flex flex-col items-center gap-3 text-gray-300">
            <svg class="size-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <title>Image unavailable</title>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
            <span class="text-sm">Image unavailable</span>
        </div>
    `,
})
export class ImagePlaceholder {}
