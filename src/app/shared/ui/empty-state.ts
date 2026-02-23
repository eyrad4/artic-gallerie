import { Component, input } from '@angular/core';

@Component({
    selector: 'app-empty-state',
    template: `
        <div class="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg class="size-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <p class="font-display text-lg">{{ message() }}</p>
            @if (subtitle()) {
                <p class="text-sm mt-1">{{ subtitle() }}</p>
            }
        </div>
    `,
})
export class EmptyState {
    readonly message = input.required<string>();

    readonly subtitle = input<string>();
}
