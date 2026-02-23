import { Component } from '@angular/core';

@Component({
    selector: 'app-details-skeleton',
    template: `
        <div class="max-w-3xl mx-auto">
            <div class="mb-6">
                <div class="size-10 rounded-full shimmer animate-shimmer"></div>
            </div>
            <div class="rounded-lg shimmer animate-shimmer aspect-[4/3] mb-7"></div>
            <div class="h-8 w-2/3 rounded shimmer animate-shimmer mb-3"></div>
            <div class="h-5 w-1/3 rounded shimmer animate-shimmer mb-6"></div>
        </div>
    `,
})
export class DetailsSkeleton {}
