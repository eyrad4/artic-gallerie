import { Component } from '@angular/core';
import { Skeleton } from '../../../shared/ui/skeleton';

@Component({
    selector: 'app-details-skeleton',
    imports: [Skeleton],
    template: `
        <div class="max-w-3xl mx-auto">
            <div class="mb-6">
                <app-skeleton width="2.5rem" height="2.5rem" [circle]="true" />
            </div>
            <app-skeleton class="mb-7" aspectRatio="4 / 3" />
            <app-skeleton class="mb-3" height="2rem" width="66%" />
            <app-skeleton class="mb-6" height="1.25rem" width="33%" />
        </div>
    `,
})
export class DetailsSkeleton {}
