import { Component, output } from '@angular/core';

@Component({
    selector: 'app-details-error',
    template: `
        <div class="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg class="size-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <title>Artwork not found</title>
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
            </svg>
            <p class="font-display text-lg">Artwork not found</p>
            <p class="text-sm mt-1">The artwork you are looking for could not be loaded.</p>
            <button
                type="button"
                class="mt-4 inline-flex items-center gap-2 py-2.5 px-5 rounded-full border-[1.5px] border-gray-200 bg-white text-sm text-gray-900 cursor-pointer transition-all duration-250 hover:border-gray-900 hover:-translate-y-px"
                (click)="goBack.emit()"
            >
                Back to gallery
            </button>
        </div>
    `,
})
export class DetailsError {
    readonly goBack = output();
}
